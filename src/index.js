// Helper styles for demo
import "./helper.css";
import { DisplayFormikState } from "./helper";

import React, { Fragment } from "react";
import { render } from "react-dom";
import { Formik } from "formik";
import * as Yup from "yup";

import Handlebars from "handlebars";
import Moment from "moment";

Handlebars.registerHelper("switch", function(value, options) {
  this._switch_value_ = value;
  var html = options.fn(this); // Process the body of the switch block
  delete this._switch_value_;
  return html;
});

Handlebars.registerHelper("case", function(value, options) {
  if (value === this._switch_value_) {
    return options.fn(this);
  }
});

let parseFormats = ["MM/dd/yyyy"];
let invalidDate = new Date("");

const ShortDateSchema = Yup.date().transform(function(value, originalValue) {
  if (this.isType(value)) return value;
  // the default coercion transform failed so lets try it with Moment instead
  value = Moment(originalValue, parseFormats);
  return value.isValid() ? value.toDate() : invalidDate;
});

addCustomValidator("chc.shortDate", ShortDateSchema);

const fields = [
  {
    id: "gender",
    label: "Patient Gender",
    type: "select",
    options: ["Male", "Female"]
  },
  {
    id: "age",
    label: "Patient Age",
    // placeholder: 'Enter your email',
    format: "integer"
  },
  {
    id: "admit",
    label: "Admit Date",
    placeholder: "mm/dd/yyyy",
    format: "short-date"
  },
  {
    id: "discharge",
    label: "Discharge Date",
    placeholder: "mm/dd/yyyy",
    format: "short-date"
  },
  {
    id: "symptoms",
    label: "Symptoms",
    lines: 3
  },
  {
    id: "history",
    label: "Patient Health History Includes",
    lines: 3
  },
  {
    id: "labs",
    label: "Labs Revealed"
  },
  {
    id: "physician_notes",
    label: "Physician Noted",
    optional: true
  },
  {
    id: "admission_hp",
    label: "Admission H&P"
  },
  {
    id: "creatine",
    label: "Creatine Range"
  }
];

const template = `This is a {{age}} year-old patient who presented to the hospital on {{admit}} with complaints of {{symptoms}}. The patient's health history includes {{history}}. Labs revealed {{labs}}. The impression noted by the ER physician was {{physician_notes}}. The admission H&P noted a plan for {{admission_hp}}. {{#switch gender}}{{#case "Male"}}He{{/case}}{{#case "Female"}}She{{/case}}{{/switch}} was discharged on {{discharge}}. {{#switch gender}}{{#case "Male"}}His{{/case}}{{#case "Female"}}Her{{/case}}{{/switch}} creatinine ranged from {{creatine}} during the stay.

Documentation does not support the diagnosis of acute kidney injury. Per KDIGO, acute kidney injury is determined by: an increase in creatinine by >=1.5x baseline (measured or historical), which is known to have occurred within the previous seven days; an increase in creatinine by 0.3 that is proven to have occurred within 48 hours; or urine output <0.5 ml/kg/hr in 6 hours (1).

Reference:
1. Kidney Disease: Improving Global Outcome (KDIGO) Acute Kidney Injury Work Group. (2012). KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Inter., Suppl. 2:1-138.
`;

// const letterSpec = {
//   fields,
//   template,
// };

const generator = Handlebars.compile(template);

const Field = ({ field, value, error, touched, ...props }) => {
  if (!field.type || field.type === "text") {
    return (
      <Fragment>
        <label htmlFor={field.id} style={{ display: "block" }}>
          {field.label}
        </label>
        <input
          id={field.id}
          placeholder={field.placeholder}
          type="text"
          value={value}
          className={error && touched ? "text-input error" : "text-input"}
          {...props}
        />
        {error && touched && <div className="input-feedback">{error}</div>}
      </Fragment>
    );
  }

  if (field.type === "select") {
    return (
      <Fragment>
        <label htmlFor={field.id} style={{ display: "block" }}>
          {field.label}
        </label>
        <select
          id={field.id}
          placeholder={field.placeholder}
          type="text"
          value={value}
          className={error && touched ? "text-input error" : "text-input"}
          {...props}
        >
          {field.options.map(option => (
            <option key={`${field.id}.${option}`}>{option}</option>
          ))}
        </select>
        {error && touched && <div className="input-feedback">{error}</div>}
      </Fragment>
    );
  }

  return null;
};

const propFor = field => {
  let prop;
  if (!field.format || field.format === "string") {
    prop = Yup.string();
  } else if (field.format === "integer") {
    prop = Yup.number()
      .integer()
      .positive();
  } else if (field.format === "short-date") {
    prop = ShortDateSchema;
  } else {
    throw new Error("unknown field type");
  }
  if (!field.optional) {
    prop = prop.required("Required");
  }
  return prop;
};

const createValidationSchema = fields => {
  const schema = fields.reduce(
    (acc, field) => ({
      ...acc,
      [field.id]: propFor(field)
    }),
    {}
  );
  console.log(schema);
  return Yup.object().shape(schema);
};

const App = () => {
  // const [output, setOutput] = useState("");
  return (
    <div className="app">
      <Formik
        // initialValues={{ email: "" }}
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            // alert(JSON.stringify(values, null, 2));
            // setOutput("foo");
            setSubmitting(false);
          }, 500);
        }}
        validationSchema={createValidationSchema(fields)}
      >
        {props => {
          const {
            values,
            touched,
            errors,
            dirty,
            isSubmitting,
            handleChange,
            handleBlur,
            handleSubmit,
            handleReset,
            isValid
          } = props;
          return (
            <form onSubmit={handleSubmit}>
              {fields.map(field => (
                <Field
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  error={errors[field.id]}
                  touched={touched[field.id]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              ))}
              {/* <button
                type="button"
                className="outline"
                onClick={handleReset}
                disabled={!dirty || isSubmitting}
              >
                Reset
              </button>
              <button type="submit" disabled={isSubmitting}>
                Submit
              </button> */}
              {isValid ? <pre>{generator(values)}</pre> : ""}
              {/* <DisplayFormikState {...props} /> */}
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

render(<App />, document.getElementById("root"));
