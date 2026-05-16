import * as yup from "yup";

/**
 * Password fields validate only when useForm `context.changePassword` is true
 * (same stack as Login / Register: yup + @hookform/resolvers).
 */
export const EditProfileValidation = yup.object().shape({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  oldPassword: yup.string().when("$changePassword", {
    is: true,
    then: (schema) => schema.required("Current password is required"),
    otherwise: (schema) => schema.optional(),
  }),
  newPassword: yup.string().when("$changePassword", {
    is: true,
    then: (schema) =>
      schema
        .required("New password is required")
        .min(6, "Password must be at least 6 characters")
        .matches(
          /[A-Z]/,
          "Password must include at least one uppercase letter"
        )
        .matches(
          /[!@#$%^&*()_\-?]/,
          "Password must include at least one special character (!@#$%^&*()_-?)"
        ),
    otherwise: (schema) => schema.optional(),
  }),
  confirmPassword: yup.string().when("$changePassword", {
    is: true,
    then: (schema) =>
      schema
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
    otherwise: (schema) => schema.optional(),
  }),
});
