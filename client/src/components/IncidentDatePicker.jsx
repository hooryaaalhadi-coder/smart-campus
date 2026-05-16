import DatePicker from "react-datepicker";
import { Controller } from "react-hook-form";
import moment from "moment";

/**
 * Do not use portalId="root" — it targets the same DOM node as the React app
 * and can blank the page. Floating UI + strategy fixed keeps the popper above modals.
 */
const IncidentDatePicker = ({ control }) => {
  return (
    <Controller
      name="incidentDate"
      control={control}
      render={({ field }) => {
        const raw = field.value;
        const selected =
          raw && !Number.isNaN(new Date(raw).getTime()) ? new Date(raw) : null;
        const mSel = selected ? moment(selected) : null;
        const selValid = Boolean(mSel?.isValid());

        const now = new Date();

        const minTime = selValid
          ? mSel.clone().startOf("day").toDate()
          : moment().startOf("day").toDate();

        const maxTime = selValid
          ? mSel.isSame(moment(), "day")
            ? now
            : mSel.clone().endOf("day").toDate()
          : moment().endOf("day").toDate();

        return (
          <DatePicker
            selected={selected}
            onChange={(date) =>
              field.onChange(
                date && !Number.isNaN(date.getTime()) ? date.toISOString() : ""
              )
            }
            maxDate={now}
            minTime={minTime}
            maxTime={maxTime}
            showTimeSelect
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="dd/MM/yyyy h:mm aa"
            placeholderText="Date & time"
            className="form-control text-success sc-datepicker-input"
            wrapperClassName="sc-datepicker-wrap w-100"
            calendarClassName="sc-datepicker-calendar"
            popperClassName="sc-datepicker-popper"
            showPopperArrow={false}
            autoComplete="off"
            popperProps={{ strategy: "fixed" }}
          />
        );
      }}
    />
  );
};

export default IncidentDatePicker;
