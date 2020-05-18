import React, { useEffect, useState } from "react";
import { i18next } from "/client/api";
import { Box, Card, CardContent, CardHeader, Grid, makeStyles, MenuItem } from "@material-ui/core";

import useReactoForm from "reacto-form/cjs/useReactoForm";
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

/**
 * @name ProductStyliForm
 * @param {Object} props Component props
 * @param {Object} ref Forwarded ref
 * @returns {React.Component} Variant form React component
 */
const AttributeSetTemplate = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const { title, attributeGroupLabel, attributeGroupId, fields, submitForm, fieldValues } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metafields, setMetafields] = useState({});
  const [stateFields, setStateFields] = useState(fieldValues || {});
  console.log(stateFields, 'stateFieldsstateFields' , typeof(stateFields))

  const {
    product
  } = useProduct();

  useEffect(() => {
    if (product) {
      setMetafields(clone(product.metafields) || []);
    }
  }, [
    product
  ]);

  return (
    <Card className={classes.card} ref={ref}>
      <CardHeader title={attributeGroupLabel}/>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitForm(attributeGroupId, attributeGroupLabel, stateFields);
          }}
        >
          <Grid container spacing={1}>
            {fields.map((field) => {
              const { id, label } = field;
              const stateKey = `${label}`;
              return (
                <Grid item sm={6} key={id}>
                  <TextField
                    id={id}
                    className={classes.textField}
                    fullWidth
                    onChange={(event) =>
                      setStateFields({
                        ...stateFields,
                        [stateKey]: event.target.value
                      })
                    }
                    value={stateFields[stateKey]}
                    label={label}
                  />
                </Grid>
              );
            })}
          </Grid>

          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Button
              color="primary"
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

export default AttributeSetTemplate;
