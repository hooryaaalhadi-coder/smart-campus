import * as yup from "yup";

export const ForgotPasswordValidation = yup.object().shape({
  email: yup
    .string()
    .email("Enter valid email")
    .required("Email is required"),
  password: yup
    .string()
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
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});
