import React, { useEffect, useState } from "react";
import { i18next } from "/client/api";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  makeStyles,
  Typography, FormLabel, MenuItem
} from "@material-ui/core";

import useReactoForm from "reacto-form/cjs/useReactoForm";
import SimpleSchema from "simpl-schema";
import muiOptions from "reacto-form/cjs/muiOptions";
import { Button, TextField } from "@reactioncommerce/catalyst";
import useProduct from "../hooks/useProduct";

import clone from "clone";

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2)
  },
  textField: {
    marginBottom: theme.spacing(4)
  }
}));

const formSchema = new SimpleSchema({
  productType: {
    type: String,
    optional: true
  },
  productWebsites: {
    type: String,
    optional: true
  },
  taxClassName: {
    type: String,
    optional: true
  },
  visibility: {
    type: String,
    optional: true
  },
  createdAt: {
    type: String,
    optional: true
  },
  updatedAt: {
    type: String,
    optional: true
  }
});

const validator = formSchema.getFormValidator();

/**
 * @name ProductStyliForm
 * @param {Object} props Component props
 * @param {Object} ref Forwarded ref
 * @returns {React.Component} Variant form React component
 */
const ProductStyliForm = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metafields, setMetafields] = useState([]);

  const {
    onUpdateProduct,
    product
  } = useProduct();

  const {
    getFirstErrorMessage,
    getInputProps,
    hasErrors,
    isDirty,
    submitForm
  } = useReactoForm({
    async onSubmit(formData) {
      setIsSubmitting(true);
      const cleanedInput = {
        metafields: [
          {
            key: "productType",
            value: formData.productType
          },
          {
            key: "productWebsites",
            value: formData.productWebsites
          },
          {
            key: "taxClassName",
            value: formData.taxClassName
          },
          {
            key: "visibility",
            value: formData.visibility
          },
          {
            key: "createdAt",
            value: formData.createdAt
          },
          {
            key: "updatedAt",
            value: formData.updatedAt
          }
        ]
      };

      await onUpdateProduct({
        productId: product._id,
        product: cleanedInput
      });

      setIsSubmitting(false);
    },
    validator(formData) {
      return validator(formSchema.clean(formData));
    },
    value: product
  });

  const getValueMeta = (keyVal) => {
    const filterValue = metafields?.filter(v => v["key"] === keyVal);
    return filterValue[0]?.value;
  };

  useEffect(() => {
    if (product) {
      setMetafields(clone(product.metafields) || []);
    }
  }, [
    product
  ]);

  const isSaveDisabled = !product || !isDirty || isSubmitting;

  const selOptions = [
    {
      value: "simple",
      label: "Simple Product"
    },
    {
      value: "configurable",
      label: "Configurable Product"
    }
  ];

  return (
    <Card className={classes.card} ref={ref}>
      <CardHeader title={i18next.t("admin.productDetailEdit.styliParams")}/>
      <CardContent>
        {(product) ?
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitForm();
            }}
          >
            <Grid container spacing={1}>
              <Grid item sm={6}>
                <TextField
                  className={classes.textField}
                  error={hasErrors(["productType"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["productType"])}
                  label={i18next.t("admin.productDetailEdit.productType")}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") submitForm();
                  }}
                  select
                  value={getValueMeta("productType")}
                  {...getInputProps("productType", muiOptions)}
                >
                  {selOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type="string"
                  className={classes.textField}
                  error={hasErrors(["productWebsites"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["productWebsites"]) || i18next.t("admin.helpText.productWebsites")}
                  label={i18next.t("admin.helpText.productWebsites")}
                  placeholder=""
                  value={getValueMeta("productWebsites")}
                  {...getInputProps("productWebsites", muiOptions)}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type="string"
                  className={classes.textField}
                  error={hasErrors(["taxClassName"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["taxClassName"]) || i18next.t("admin.helpText.taxClassName")}
                  label={i18next.t("admin.helpText.taxClassName")}
                  placeholder=""
                  value={getValueMeta("taxClassName")}
                  {...getInputProps("taxClassName", muiOptions)}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type="string"
                  className={classes.textField}
                  error={hasErrors(["visibility"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["visibility"]) || i18next.t("admin.helpText.visibility")}
                  label={i18next.t("admin.productDetailEdit.visibility")}
                  placeholder=""
                  value={getValueMeta("visibility")}
                  {...getInputProps("visibility", muiOptions)}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type="string"
                  className={classes.textField}
                  error={hasErrors(["createdAt"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["createdAt"]) || i18next.t("admin.helpText.createdAt")}
                  label={i18next.t("admin.productDetailEdit.createdAt")}
                  placeholder=""
                  {...getInputProps("createdAt", muiOptions)}
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  type="string"
                  className={classes.textField}
                  error={hasErrors(["updatedAt"])}
                  fullWidth
                  helperText={getFirstErrorMessage(["updatedAt"]) || i18next.t("admin.helpText.updatedAt")}
                  label={i18next.t("admin.productDetailEdit.updatedAt")}
                  placeholder=""
                  {...getInputProps("updatedAt", muiOptions)}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" alignItems="center">
              <Button
                color="primary"
                disabled={isSaveDisabled}
                isWaiting={isSubmitting}
                type="submit"
                variant="contained"
              >
                {i18next.t("app.saveChanges")}
              </Button>
            </Box>
          </form>
          : ""}
      </CardContent>
    </Card>
  );
});

export default ProductStyliForm;
