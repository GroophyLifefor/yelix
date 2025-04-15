// deno-lint-ignore-file no-explicit-any
import type {
  OpenAPI,
  OpenAPIDataTypes,
  OpenAPIDefaultSchema,
  OpenAPIExtenedRequestBodySchema,
  OpenAPIMethods,
  OpenAPIPathItem,
  OpenAPIProperty,
  OpenAPIRequestBodyNonDocumented,
} from './Core/index.ts';
import type { NewEndpointParams, OpenAPIParams } from './Core/index.ts';
import {
  type ArrayZod,
  inp,
  type ObjectZod,
  YelixValidationBase,
} from '@/mod.ts';

class YelixOpenAPI {
  _openAPI: OpenAPI | null = null;
  private customValidationDescriptions: Record<string, (_: any) => string> = {};

  constructor(params: OpenAPIParams) {
    this._openAPI = {
      openapi: '3.1.0',
      info: {
        title: params.title,
        version: params.version,
        description: params.description || 'Yelix API Documentation',
      },
      paths: {},
      servers: params.servers || [],
    };
  }

  /**
   * Registers a custom validation rule description for a specific kind.
   * If a description for the given kind already exists, it will be overridden.
   *
   * @param kind - The type of validation rule to describe.
   * @param fn - A function that takes any input and returns a string describing the validation rule.
   * @returns A boolean indicating whether an existing description was overridden (`true`) or not (`false`).
   */
  describeValidationRule(kind: string, fn: (_: any) => string): boolean {
    let isOverriding = false;

    if (this.customValidationDescriptions[kind]) {
      isOverriding = true;
    }

    this.customValidationDescriptions[kind] = fn;
    return isOverriding;
  }

  getValidationRuleDescription(kind: string): (_: any) => string {
    return this.customValidationDescriptions[kind];
  }

  getJSON(): OpenAPI {
    return this._openAPI!;
  }

  private getRandomDateBetween(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = Math.random() * (endTime - startTime) + startTime;
    return new Date(randomTime);
  }

  private generateYelixExample(
    yelixSchema: YelixValidationBase,
    generationType: 'input' | 'output' = 'input'
  ): any {
    const type = yelixSchema.type;
    if (type === 'not-set') return 'unknown';

    const isDatetime = yelixSchema.rules.some((r) => r.title === 'datetime');
    const isOptional = yelixSchema.rules.some((r) => r.title === 'optional');
    const isEmail = yelixSchema.rules.some((r) => r.title === 'email');

    if (isOptional) return undefined;

    if (
      yelixSchema.meta[
        generationType === 'input' ? 'exampleInput' : 'exampleOutput'
      ]
    ) {
      return yelixSchema.meta[
        generationType === 'input' ? 'exampleInput' : 'exampleOutput'
      ];
    }

    switch (type) {
      case 'any': {
        return 'any value';
      }
      case 'string': {
        if (isEmail) {
          return 'somemail@domain.com';
        } else if (isDatetime) {
          return new Date().toISOString();
        } else {
          return 'example string';
        }
      }
      case 'number': {
        const min =
          yelixSchema.rules.find((r) => r.title === 'min')?.value || 0;
        const max =
          yelixSchema.rules.find((r) => r.title === 'max')?.value || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      case 'boolean': {
        return Math.random() < 0.5;
      }
      case 'date': {
        return this.getRandomDateBetween(
          new Date(2012, 0, 1),
          new Date()
        ).toISOString();
      }
      case 'file': {
        return 'example.txt';
      }
      case 'object': {
        if ('subFields' in yelixSchema) {
          const example: Record<string, any> = {};
          const subFields = yelixSchema.subFields as Record<
            string,
            YelixValidationBase
          >;
          if (!subFields) return {};

          for (const [key, subSchema] of Object.entries(subFields)) {
            const value = this.generateYelixExample(subSchema, generationType);
            if (value !== undefined) {
              example[key] = value;
            }
          }
          return example;
        }
        return {};
      }
      case 'array': {
        const validator = (yelixSchema as ArrayZod<any>).validator;
        if (validator) {
          return [this.generateYelixExample(validator, generationType)];
        }
        return ['example'];
      }
      default: {
        return 'unknown';
      }
    }
  }

  private getType(type: string) {
    const types = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string',
      file: 'string',
      array: 'array',
      object: 'object',
    };

    return types[type as keyof typeof types] || 'string';
  }

  private yelixZodToJsonSchema(
    yelixSchema: YelixValidationBase
  ): OpenAPIDefaultSchema {
    const schema: OpenAPIDefaultSchema = { type: 'string' };

    const type = yelixSchema.type;
    if (type === 'string') {
      schema.type = 'string';
      // Add format for email validation
      if (yelixSchema.rules.some((r) => r.title === 'email')) {
        schema.format = 'email';
      }
    } else if (type === 'number') {
      schema.type = 'number';
    } else if (type === 'boolean') {
      schema.type = 'boolean';
    } else if (type === 'date') {
      schema.type = 'string';
      schema.format = 'date-time'; // Add date-time format for dates
    } else if (type === 'file') {
      schema.type = 'string';
    } else if (type === 'array') {
      schema.type = 'array';
      // Add items property for arrays
      const arrayTypeRule = yelixSchema.rules.find(
        (r) => r.title === 'arrayType'
      );
      if (arrayTypeRule?.value) {
        schema.items = this.yelixZodToJsonSchema(arrayTypeRule.value);
      } else {
        schema.items = { type: 'string' }; // Default to string if not specified
      }
    } else if (type === 'object') {
      schema.type = 'object';
      if ('subFields' in yelixSchema) {
        schema.properties = {};
        for (const [key, subSchema] of Object.entries(
          yelixSchema.subFields as Record<string, YelixValidationBase>
        )) {
          schema.properties[key] = this.yelixZodToJsonSchema(subSchema);
        }
      }
    }

    return schema;
  }

  private yelixZodToJsonBodySchema(
    yelixSchema: ObjectZod<any>
  ): OpenAPIExtenedRequestBodySchema {
    const schema: OpenAPIExtenedRequestBodySchema = {
      type: 'object',
    };

    const subFields: Record<string, YelixValidationBase> =
      yelixSchema.subFields;

    schema.properties = {};
    const requiredFields: string[] = [];

    const keys = Object.keys(subFields);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const subField = subFields[key];

      // Check if field is required
      if (subField.hasRule('required')) {
        requiredFields.push(key);
      }

      const property: OpenAPIProperty = {
        type: this.getType(subField.type) as OpenAPIDataTypes,
      };

      // Handle specific field types
      if (subField.type === 'array') {
        property.items = {};
        const arrayTypeRule = subField.rules.find(
          (r) => r.title === 'arrayType'
        );
        if (arrayTypeRule?.value) {
          property.items.type = this.getType(
            arrayTypeRule.value.type
          ) as OpenAPIDataTypes;
        } else {
          property.items.type = (subField as ArrayZod<any>)
            .itemsType as OpenAPIDataTypes;
        }
      } else if (subField.type === 'object' && 'subFields' in subField) {
        property.properties = {};
        const subSubFields = subField.subFields as Record<
          string,
          YelixValidationBase
        >;
        for (const [subKey, subSubField] of Object.entries(subSubFields)) {
          property.properties[subKey] = {
            type: this.getType(subSubField.type) as OpenAPIDataTypes,
          };
        }
      } else if (subField.type === 'date') {
        property.format = 'date-time';
      } else if (subField.type === 'string' && subField.hasRule('email')) {
        property.format = 'email';
      }

      // Handle min/max rules
      const minRule = subField.rules.find((r) => r.title === 'min');
      const maxRule = subField.rules.find((r) => r.title === 'max');

      if (subField.type === 'string') {
        if (minRule) property.minLength = minRule.value;
        if (maxRule) property.maxLength = maxRule.value;
      } else if (subField.type === 'number') {
        if (minRule) property.minimum = minRule.value;
        if (maxRule) property.maximum = maxRule.value;
      } else if (subField.type === 'array') {
        if (minRule) property.minItems = minRule.value;
      }

      schema.properties[key] = property;
    }

    // Add required fields if any
    if (requiredFields.length > 0) {
      schema.required = requiredFields;
    }

    return schema;
  }

  private getParamsFromPath(path: string) {
    return [...path.matchAll(/{([a-zA-Z0-9_]+)}/g)].map((match) => match[1]);
  }

  addNewEndpoint(apiDoc: NewEndpointParams) {
    if (!this._openAPI) {
      throw new Error('OpenAPI not initialized');
    }

    const { path, method } = apiDoc;
    const defaultSummary = `${method.toUpperCase()} ${path}`;

    const responses: Record<string, any> = {};
    const responseStatusCodes = Object.keys(apiDoc.responses || {});
    for (const statusCode of responseStatusCodes) {
      const response = apiDoc.responses![statusCode];

      responses[statusCode] = {
        description: response.description,
        content: {
          [response.type]: {
            schema: this.yelixZodToJsonSchema(
              response.zodSchema || inp().string()
            ),
            examples: {
              autoGenerated: this.generateYelixExample(
                response.zodSchema || inp().string(),
                'output'
              ),
            },
          },
        },
      };
    }

    const parameters = [];
    const queries = (apiDoc.validation as any)?.query;

    const params = this.getParamsFromPath(path);
    for (const param of params) {
      parameters.push({
        name: param,
        in: 'path',
        required: true,
        schema: {
          type: 'string',
        },
      });
    }

    if (queries) {
      for (const key in queries) {
        const query = queries[key];
        const queryDescription = apiDoc.query?.[key]?.description;
        let queryDefaultDescription = ''; // Markdown

        if (query instanceof YelixValidationBase) {
          queryDefaultDescription += '###### Validation Rules\n';

          const zodRules = query.rules || [];
          for (const rule of zodRules) {
            const customDescription = this.getValidationRuleDescription(
              rule.title
            );

            if (customDescription) {
              queryDefaultDescription += customDescription(rule.value) + '\n';
            } else {
              queryDefaultDescription +=
                '- ' +
                rule.title +
                (rule.value ? ': ' + rule.value : '') +
                '\n';
            }
          }
        }

        parameters.push({
          name: key,
          in: 'query',
          required: query.hasRule('required'),
          schema: this.yelixZodToJsonSchema(query),
          description: queryDescription || queryDefaultDescription,
        });
      }
    }

    const lowerMethod = method.toLowerCase() as Lowercase<OpenAPIMethods>;
    if (!lowerMethod) {
      throw new Error(`Invalid HTTP method: ${method}`);
    }

    const component: OpenAPIPathItem = {
      [lowerMethod]: {
        tags: apiDoc.tags || [],
        summary: apiDoc.title || defaultSummary,
        description: apiDoc.description || '',
        responses: responses,
        parameters,
      },
    };

    const bodies = (apiDoc.validation as any)?.body;
    if (bodies) {
      const requestBodies: OpenAPIRequestBodyNonDocumented = {};
      requestBodies.required = true;

      const schema = this.yelixZodToJsonBodySchema(bodies);

      // Fix the schema structure to match OpenAPI specification
      const contentSchema: Record<string, any> = {
        type: schema.type || 'object',
        properties: schema.properties,
      };

      // Only add required fields if they exist
      if (schema.required && schema.required.length > 0) {
        contentSchema.required = schema.required;
      }

      requestBodies.content = {
        [apiDoc.bodyType || 'application/json']: {
          schema: contentSchema,
          example: this.generateYelixExample(bodies, 'input'),
        },
      };

      component[lowerMethod]!.requestBody = requestBodies;
    }

    this._openAPI.paths![path] = component;
  }
}

export { YelixOpenAPI };
