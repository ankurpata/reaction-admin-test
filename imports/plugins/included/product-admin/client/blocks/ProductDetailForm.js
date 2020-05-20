import React, { useEffect, useState } from "react";
import i18next from "i18next";
import { Box, Button, Card, CardContent, CardHeader, makeStyles, MenuItem } from "@material-ui/core";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import SimpleSchema from "simpl-schema";
import muiOptions from "reacto-form/cjs/muiOptions";
import CountryOptions from "@reactioncommerce/api-utils/CountryOptions.js";

import { TextField, useConfirmDialog } from "@reactioncommerce/catalyst";
import useGenerateSitemaps from "/imports/plugins/included/sitemap-generator/client/hooks/useGenerateSitemaps";
import { useApolloClient } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { AttributeCodes } from "./AttributeCodes";
import clone from "clone";
import useProduct from "../hooks/useProduct";
import AttributeSetTemplate from "./AttributeSetTemplate";
import _ from "lodash";

const useStyles = makeStyles((theme) => ({
card: {
  marginBottom: theme.spacing(2)
},
textField: {
  marginBottom: theme.spacing(4),
  minWidth: 350
}
}));

const formSchema = new SimpleSchema({
title: {
  type: String,
  optional: true
},
permalink: {
  type: String,
  optional: true
},
attributeSet: {
  type: String,
  optional: true
},
myf: {
  type: String,
  optional: true
},
pageTitle: {
  type: String,
  optional: true
},
vendor: {
  type: String,
  optional: true
},
description: {
  type: String,
  optional: true
},
originCountry: {
  type: String,
  optional: true
},
shouldAppearInSitemap: {
  type: Boolean,
  optional: true
}
});

const validator = formSchema.getFormValidator();
const AttributeGroupMappingGQL = gql`
query getAttributeGroups($attributeSetId: ID!, $shopId: ID!) {
  getAttributeGroups(input:{ attributeSetId : $attributeSetId , shopId:$shopId} ) {
    attributeGroups{attributes{label, id} , attributeGroupId , attributeGroupLabel}
  }
}
`;

/**
* @name ProductDetailForm
* @param {Object} props Component props
* @returns {React.Component} Product detail form react component
*/
const ProductDetailForm = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attributeSetId, setAttributeSetId] = useState(142);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [metafields, setMetafields] = useState([]);

  const {
    onUpdateProduct,
    product,
    shopId
  } = useProduct();
  const apolloClient = useApolloClient();

  useEffect(() => {
    if (product) {
      setMetafields(clone(product.metafields) || []);
      handleAttributeSetChange(product.attributeSetCode);
    }
  }, [
    product
  ]);

  const handleAttributeSetChange = async (selAttributeSetId) => {
    const { data } = await apolloClient.query({
      query: AttributeGroupMappingGQL,
      variables: {
        attributeSetId: selAttributeSetId,
        shopId: shopId || "randomTmpFix"
      },
      fetchPolicy: "network-only"
    });

    if (data) {
      const { getAttributeGroups: { attributeGroups: attributeGroupsRes } } = data;
      // eslint-disable-next-line no-console
      console.log(attributeGroupsRes, "***handleAttributeSetChange****");
      // Set attrtibute groups
      setAttributeGroups(attributeGroupsRes);
    }
  };

  const submitAttributeForm = async (attributeGroupId, attributeGroupLabel, stateFields) => {
    let updMetaFields = [...metafields];
    updMetaFields = updMetaFields.map((metaObj) => _.omit(metaObj, ["__typename"]));

    let attributeObj = {};
    // attributeObj = _.find(metafields, ["key", attributeGroupLabel]);
    attributeObj = metafields.filter((obj) => obj.key.trim() == attributeGroupLabel.trim()
      .split(" ")
      .join("-"));
    attributeObj = attributeObj && attributeObj.length ? attributeObj[0] : undefined;


    // TODO: To be changed. Add schema for attribute set and set fields.
    if (attributeObj) {
      attributeObj.value = JSON.stringify({ ...JSON.parse(attributeObj.value), ...stateFields });
      const objPos = updMetaFields.findIndex((obj) => obj.key === attributeGroupLabel);
      updMetaFields[objPos] = attributeObj;
    } else {
      attributeObj = {
        key: attributeGroupLabel.split(" ")
          .join("-"),
        value: JSON.stringify(stateFields)
      };
      updMetaFields.push(attributeObj);
    }

    console.log(attributeObj, "attributeObj");
    console.log(updMetaFields, "updMetaFields");

    updMetaFields = updMetaFields.map((metaObj) => _.omit(metaObj, ["__typename"]));

    const res = await onUpdateProduct({
      productId: product._id,
      product: {
        metafields: updMetaFields
      }
    });
    // TODO: Check for id in res
    if (res) {
      setMetafields(updMetaFields);
    }
    // TODO: save in meta fields.
  };

  const AttributeGroupForms = () => attributeGroups.map((attributeGroup) => {
    const { attributes } = attributeGroup;
    let fieldValues;
    const groupLabel = attributeGroup.attributeGroupLabel;

    if (metafields?.length) {
      const matchObj = metafields.filter((obj) => obj.key.trim() == groupLabel.trim()
        .split(" ")
        .join("-"));
      if (matchObj && matchObj.length) {
        fieldValues = JSON.parse(matchObj[0].value);
        console.log(fieldValues, "@LOOPfieldValuesArr", typeof (fieldValues), matchObj);
      }
    }

    console.log(fieldValues, "fieldValuesArr");
    return <AttributeSetTemplate
      title=""
      attributeGroupLabel={attributeGroup.attributeGroupLabel}
      attributeGroupId={attributeGroup.attributeGroupId}
      fields={attributes}
      fieldValues={fieldValues}
      submitForm={submitAttributeForm}
    />;
  });

  const { generateSitemaps } = useGenerateSitemaps(shopId);
  const {
    openDialog: openGenerateSitemapsConfirmDialog,
    ConfirmDialog: GenerateSitemapsConfirmDialog
  } = useConfirmDialog({
    title: i18next.t("productDetailEdit.refreshSitemap", { defaultValue: "Refresh sitemap now?" }),
    cancelActionText: i18next.t("productDetailEdit.refreshSitemapNo", { defaultValue: "No, don't refresh" }),
    confirmActionText: i18next.t("productDetailEdit.refreshSitemapYes", { defaultValue: "Yes, refresh" }),
    onConfirm: () => {
      generateSitemaps();
    }
  });


  let content;

  const {
    getFirstErrorMessage,
    getInputProps,
    hasErrors,
    isDirty,
    submitForm
  } = useReactoForm({
    async onSubmit(formData) {
      const shouldConformSitemapGenerate =
        formData.shouldAppearInSitemap !== product.shouldAppearInSitemap
        && formData.isVisible && !formData.isDeleted;

      setIsSubmitting(true);

      await onUpdateProduct({
        product: formSchema.clean(formData)
      });

      if (shouldConformSitemapGenerate) {
        openGenerateSitemapsConfirmDialog();
      }

      setIsSubmitting(false);
    },
    validator(formData) {
      return validator(formSchema.clean(formData));
    },
    value: product
  });

  const originCountryInputProps = getInputProps("originCountry", muiOptions);

  if (product) {
    content = (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        <TextField
          className={classes.textField}
          error={hasErrors(["title"])}
          fullWidth
          helperText={getFirstErrorMessage(["title"])}
          label={i18next.t("productDetailEdit.title")}
          {...getInputProps("title", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["attributeSet"])}
          fullWidth
          helperText={getFirstErrorMessage(["attributeSet"])}
          label={"AttributeSet"}
          onChange={(event) => {
            setAttributeSetId(event.target.value);
            // eslint-disable-next-line no-console
            handleAttributeSetChange(+event.target.value);
            console.log(event.target.value, "Selected Attribute Id");
          }}
          select
          value={attributeSetId || ""}
        >
          {AttributeCodes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          className={classes.textField}
          error={hasErrors(["slug"])}
          fullWidth
          helperText={getFirstErrorMessage(["slug"])}
          label={i18next.t("productDetailEdit.parmalink")}
          {...getInputProps("slug", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["pageTitle"])}
          fullWidth
          helperText={getFirstErrorMessage(["pageTitle"])}
          label={i18next.t("productDetailEdit.pageTitle")}
          {...getInputProps("pageTitle", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["vendor"])}
          fullWidth
          helperText={getFirstErrorMessage(["vendor"])}
          label={i18next.t("productDetailEdit.vendor")}
          {...getInputProps("vendor", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["description"])}
          fullWidth
          helperText={getFirstErrorMessage(["description"])}
          label={i18next.t("productDetailEdit.description")}
          {...getInputProps("description", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["originCountry"])}
          fullWidth
          helperText={getFirstErrorMessage(["originCountry"])}
          label={i18next.t("productDetailEdit.originCountry")}
          onKeyPress={(event) => {
            if (event.key === "Enter") submitForm();
          }}
          select
          {...originCountryInputProps}
          value={originCountryInputProps.value || ""}
        >
          {CountryOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {/* <FormControlLabel*/}
        {/*  label={i18next.t("productDetailEdit.shouldAppearInSitemap")}*/}
        {/*  control={<Checkbox/>}*/}
        {/*  {...getInputProps("shouldAppearInSitemap", muiCheckboxOptions)}*/}
        {/* />*/}
        <Box textAlign="right">
          <Button
            color="primary"
            disabled={!isDirty || isSubmitting}
            variant="contained"
            type="submit"
          >
            {i18next.t("app.saveChanges")}
          </Button>
        </Box>
        <GenerateSitemapsConfirmDialog/>
      </form>
    );
  }

  if (attributeGroups) {
    return (
      <>
        {/* Default Detail Start*/}
        <Card className={classes.card} ref={ref}>
          <CardHeader title={i18next.t("admin.productAdmin.details")}/>
          <CardContent>
            {content}
          </CardContent>
        </Card>
        {/* Default detail card end*/}
        <AttributeGroupForms attributeGroups={attributeGroups}/>
      </>
    );
  }
  return (
    <Card className={classes.card} ref={ref}>
      <CardHeader title={i18next.t("admin.productAdmin.details")}/>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
})
;

export default ProductDetailForm;
