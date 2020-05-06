import React, { useState } from "react";
import { i18next } from "/client/api";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  makeStyles,
  Typography
} from "@material-ui/core";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import SimpleSchema from "simpl-schema";
import muiOptions from "reacto-form/cjs/muiOptions";
import { Button, TextField } from "@reactioncommerce/catalyst";
import useProduct from "../hooks/useProduct";

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2)
  },
  textField: {
    marginBottom: theme.spacing(4)
  }
}));

const formSchema = new SimpleSchema({
  storeViewCode: {
    type: String,
    optional: true
  },
  attributeSetCode: {
    type: String,
    optional: true
  }
});

const validator = formSchema.getFormValidator();

/**
 * @name VariantStyliParams
 * @param {Object} props Component props
 * @param {Object} ref Forwarded ref
 * @returns {React.Component} Variant form React component
 */
const VariantStyliParams = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    onUpdateProductVariant,
    currentVariant,
    product,
    variant,
    option
  } = useProduct();

  const editingVariant = option || variant;

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
            key: "storeViewCode",
            value: formData.storeViewCode
          },
          {
            key: "attributeSetCode",
            value: formData.attributeSetCode
          }
        ]
      };

      await onUpdateProductVariant({
        variantId: editingVariant._id,
        variant: cleanedInput
      });

      setIsSubmitting(false);
    },
    validator(formData) {
      return validator(formSchema.clean(formData));
    },
    value: (currentVariant && currentVariant.pricing) || {}
  });

  const isSaveDisabled = !product || !isDirty || isSubmitting;

  return (
    <Card className={classes.card} ref={ref}>
      <CardHeader title={i18next.t("admin.productVariant.styliParams")}/>
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
                type="string"
                className={classes.textField}
                error={hasErrors(["storeViewCode"])}
                fullWidth
                helperText={getFirstErrorMessage(["storeViewCode"]) || i18next.t("admin.helpText.storeViewCode")}
                label={i18next.t("admin.productVariant.storeViewCode")}
                placeholder=""
                {...getInputProps("storeViewCode", muiOptions)}
              />
            </Grid>
            <Grid item sm={6}>
              <TextField
                type="string"
                className={classes.textField}
                error={hasErrors(["attributeSetCode"])}
                fullWidth
                helperText={getFirstErrorMessage(["attributeSetCode"]) || i18next.t("admin.helpText.attributeSetCode")}
                label={i18next.t("admin.productVariant.attributeSetCode")}
                placeholder=""
                {...getInputProps("attributeSetCode", muiOptions)}
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

export default VariantStyliParams;
