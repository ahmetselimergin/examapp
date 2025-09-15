import { ref, reactive, computed } from "vue";

export interface FormField {
  value: any;
  rules?: ((value: any) => string | boolean)[];
  required?: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export function useForm(initialState: FormState) {
  const form = reactive<FormState>(initialState);
  const errors = ref<Record<string, string>>({});
  const isSubmitting = ref(false);

  const isValid = computed(() => {
    return (
      Object.keys(errors.value).length === 0 &&
      Object.values(form).every(
        (field) =>
          !field.required ||
          (field.value !== null &&
            field.value !== undefined &&
            field.value !== "")
      )
    );
  });

  const validateField = (fieldName: string) => {
    const field = form[fieldName];
    if (!field) return;

    errors.value[fieldName] = "";

    // Required validation
    if (field.required && (!field.value || field.value === "")) {
      errors.value[fieldName] = "Bu alan zorunludur";
      return;
    }

    // Custom rules validation
    if (field.rules) {
      for (const rule of field.rules) {
        const result = rule(field.value);
        if (result !== true) {
          errors.value[fieldName] =
            typeof result === "string" ? result : "Geçersiz değer";
          return;
        }
      }
    }
  };

  const validateForm = () => {
    errors.value = {};
    Object.keys(form).forEach((fieldName) => {
      validateField(fieldName);
    });
    return isValid.value;
  };

  const setFieldValue = (fieldName: string, value: any) => {
    if (form[fieldName]) {
      form[fieldName].value = value;
      validateField(fieldName);
    }
  };

  const setFieldError = (fieldName: string, error: string) => {
    errors.value[fieldName] = error;
  };

  const clearErrors = () => {
    errors.value = {};
  };

  const resetForm = () => {
    Object.keys(form).forEach((fieldName) => {
      form[fieldName].value = "";
    });
    clearErrors();
  };

  const getFormData = () => {
    const data: Record<string, any> = {};
    Object.keys(form).forEach((fieldName) => {
      data[fieldName] = form[fieldName].value;
    });
    return data;
  };

  const setFormData = (data: Record<string, any>) => {
    Object.keys(data).forEach((fieldName) => {
      if (form[fieldName]) {
        form[fieldName].value = data[fieldName];
      }
    });
  };

  return {
    form,
    errors: computed(() => errors.value),
    isValid,
    isSubmitting,
    validateField,
    validateForm,
    setFieldValue,
    setFieldError,
    clearErrors,
    resetForm,
    getFormData,
    setFormData,
  };
}
