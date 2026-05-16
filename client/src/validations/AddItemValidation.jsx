import * as yup from "yup";
import { normalizeOmaniPhoneE164 } from "./omaniPhone";

export const AddItemValidation = yup.object().shape({
  productName: yup
    .string()
    .trim()
    .required("Item name is required")
    .min(2, "Item name is too short"),
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .transform((v) => normalizeOmaniPhoneE164(v) ?? "")
    .matches(
      /^968[79]\d{7}$/,
      "Phone must be exactly 8 digits and start with 7 or 9 (e.g. 91234567 or +968 9…)."
    ),
  incidentDate: yup
    .string()
    .required("Date of incident is required")
    .test("valid-date", "Enter a valid date", (v) => {
      if (!v) return false;
      return !Number.isNaN(new Date(v).getTime());
    })
    .test("not-future", "Date and time cannot be in the future", (v) => {
      if (!v) return false;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return false;
      return d.getTime() <= Date.now();
    }),
  incidentLocation: yup
    .string()
    .trim()
    .required("Location is required")
    .min(2, "Location is too short"),
  description: yup
    .string()
    .trim()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters"),
});
