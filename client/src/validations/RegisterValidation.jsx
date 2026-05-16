import * as yup from "yup";
export const RegisterValidation = yup.object().shape({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
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
    .required("Confirm Password is required"),
});
