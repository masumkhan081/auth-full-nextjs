import { schemas } from "../schemas/validation.schema";

export const validateForm = (schemaKey, formData) => {
  const schema = schemas[schemaKey];
  if (!schema) {
    throw new Error(`Schema for key "${schemaKey}" not found`);
  }

  const result = schema.safeParse(formData);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  const fieldErrors = {};
  if (result.error && result.error.issues) {
    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = err.message;
      }
    });
  }

  return { success: false, data: null, errors: fieldErrors };
};
