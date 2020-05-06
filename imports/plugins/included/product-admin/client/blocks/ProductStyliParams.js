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
  }
});

const validator = formSchema.getFormValidator();

/**
 * @name ProductStyliParams
 * @param {Object} props Component props
 * @param {Object} ref Forwarded ref
 * @returns {React.Component} Variant form React component
 */
const ProductStyliParams = React.forwardRef((props, ref) => {
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
    }
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
      <CardHeader title={i18next.t("productVariant.styliParams")}/>
      <CardContent>
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
                label={i18next.t("productDetailEdit.productType")}
                onKeyPress={(event) => {
                  if (event.key === "Enter") submitForm();
                }}
                select
                {...getInputProps("productType", muiOptions)}
                value={getValueMeta("productType")}
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
                label={i18next.t("productVariant.productWebsites")}
                placeholder=""
                {...getInputProps("productWebsites", muiOptions)}
                value={getValueMeta("productWebsites")}
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
      </CardContent>
    </Card>
  );
});

export default ProductStyliParams;
