import React, { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Blocks, Components } from "@reactioncommerce/reaction-components";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import _ from "lodash";


import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import CloseIcon from "mdi-material-ui/Close";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";
import useCurrentShopId from "../../../../../client/ui/hooks/useCurrentShopId";
import createProductMutation from "../graphql/mutations/createProduct";
import { i18next } from "../../../../../../client/modules/i18n";
import CreateProductVariantMutation from "../graphql/mutations/createProductVariant";
import PublishProductsToCatalogMutation from "../graphql/mutations/publishProductsToCatalog";
import { Card as MuiCard, CardContent, CardHeader } from "@material-ui/core";
import productsQuery from "../graphql/queries/products";
import UpdateProductMutation from "../graphql/mutations/updateProduct";
import UpdateProductVariantMutation from "../graphql/mutations/updateProductVariant";
import ImportProductsByCsv from "./ImportProductsByCsv";
import gql from "graphql-tag";


const styles = (theme) => ({
  block: {
    marginBottom: theme.spacing(3)
  },
  importButton: {
    marginTop: "10em"
  },
  updateBtn: {
    marginLeft: "1em"
  }
});

const AttributeGroupMappingGQL = gql`
  query getAttributeGroups($attributeSetId: ID!, $shopId: ID!) {
    getAttributeGroups(input:{ attributeSetId : $attributeSetId , shopId:$shopId} ) {
      attributeGroups{attributes{label, id} , attributeGroupId , attributeGroupLabel}
    }
  }
`;
/**
 * ProductImport layout component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductImport(props) {
  const apolloClient = useApolloClient();
  const { classes, ...blockProps } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [updateProduct] = useMutation(UpdateProductMutation);
  const [createProduct, { error: createProductError }] = useMutation(createProductMutation);
  const [createProductVariant] = useMutation(CreateProductVariantMutation);
  const [publishProducts] = useMutation(PublishProductsToCatalogMutation);
  const [updateProductVariant] = useMutation(UpdateProductVariantMutation);

  // const history = useHistory();
  const [shopId] = useCurrentShopId();
  // const [shopId] = ["cmVhY3Rpb24vc2hvcDpwbmFyTG5KNkFxQXgzQnNneA"];

  const [files, setFiles] = useState([]);

  const createProductCsv = async (productInit) => {
    const { data: { createProduct: { product } } } = await createProduct({
      variables: {
        input: {
          shopId,
          product: productInit,
          shouldCreateFirstVariant: false
        }
      }
    });
    return product._id;
  };

  const createProductVariantCsv = async (variantInit, productId) => {
    const { data } = await createProductVariant({
      variables: {
        input: {
          shopId,
          productId,
          variant: variantInit
        }
      }
    });
  };

  const publishProductsCsv = async (productIds) => {
    await publishProducts({
      variables: {
        productIds
      }
    });
  };

  const randomUpdateProduct = async () => {
    let total = 0;
    let j = 0;
    let rndStr = getRandString(5);
    const startTime = Date.now();
    while (j < 1) {
      j++;
      const { data: { products: { nodes } } } = await apolloClient.query({
        query: productsQuery,
        variables: {
          shopIds: [shopId],
          limit: 50
        },
        fetchPolicy: "network-only"
      });
      // eslint-disable-next-line no-console,no-unused-vars
      for (const product of nodes) {
        // eslint-disable-next-line no-await-in-loop,no-plusplus
        total++;
        // eslint-disable-next-line no-await-in-loop
        await updateProduct({
          variables: {
            input: {
              productId: product._id,
              shopId,
              product: {
                description: `Random Description ${rndStr}`
              }
            }
          }
        });
        const variantArray = _.map(product.variants, "_id");
        for (const variantId of variantArray) {
          // eslint-disable-next-line no-plusplus
          total++;
          // eslint-disable-next-line no-await-in-loop
          await updateProductVariant({
            variables: {
              input: {
                shopId,
                variant: { price: Math.floor(Math.random() * 100) + 1 },
                variantId
              }
            }
          });
        }
      }
    }
    const timeElapsed = (Date.now() - startTime) / 1000;
    // eslint-disable-next-line no-console
    console.log(`Total of ${total} products updated including variants. Time taken - ${timeElapsed} seconds.`);
    enqueueSnackbar(`Total of ${total} products updated including variants. Time taken - ${timeElapsed} seconds.`, { variant: "success" });

  };

  const getRandString = (length) => {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const CSV_FILE_TYPES = [
    "text/csv",
    "text/plain",
    "text/x-csv",
    "application/vnd.ms-excel",
    "application/csv",
    "application/x-csv",
    "text/comma-separated-values",
    "text/x-comma-separated-values",
    "text/tab-separated-values"
  ];

  const onDrop = (accepted) => {
    if (accepted.length === 0) return;
    setFiles(accepted);
  };

  // Filter by file event handlers
  const { getRootProps, getInputProps } = useDropzone({
    accept: CSV_FILE_TYPES,
    disableClick: true,
    disablePreview: true,
    multiple: false,
    onDrop
  });

  const getMetaFields = (data) => {
    const { attributeSetCode } = data;
    // const attributeGroupMapping = getAttributeMapping(attributeSetCode); //TODO: New graphql query to fetch mapping based on setcode not setid
    const { data } = await apolloClient.query({
      query: AttributeGroupMappingGQL,
      variables: {
        attributeSetId: attributeSetCode,
        shopId: shopId || "randomTmpFix"
      },
      fetchPolicy: "network-only"
    });

    if (data) {
      const { getAttributeGroups: { attributeGroups: attributeGroupsRes } } = data;
      console.log(attributeGroupsRes, "attributeGroupsRes");
      // attributeGroupsRes populate values.
    }
    //populate values for attributes.
    // stringify and return values

  };

  const formatProductObj = (productObj) => {
    const metafields = getMetaFields(productObj);

  };


  const mapAndInsertProduct = async (row) => {
    const [
      // eslint-disable-next-line no-unused-vars,max-len
      sku, storeViewCode, attributeSetCode, productType, categories, productWebsites, name, weight, productOnline, taxClassName, visibility, price, originalBasePrice, specialPrice, specialPriceFromDate, specialPriceToDate, createdAt, updatedAt, newFromDate, newToDate, displayProductOptionsIn, mapPrice, msrpPrice, mapEnabled, giftMessageAvailable, customDesign, customDesignFrom, customDesignTo, customLayoutUpdate, pageLayout, productOptionsContainer, msrpDisplayActualPriceType, countryOfManufacture, additionalAttributes, qty, outOfStockQty, useConfigMinQty, isQtyDecimal, allowBackorders, useConfigBackorders, minCartQty, useConfigMinSaleQty, maxCartQty, useConfigMaxSaleQty, isInStock, notifyOnStockBelow, useConfigNotifyStockQty, manageStock, useConfigManageStock, useConfigQtyIncrements, qtyIncrements, useConfigEnableQtyInc, enableQtyIncrements, isDecimalDivided, websiteId, relatedSkus, relatedPosition, crosssellSkus, crosssellPosition, upsellSkus, upsellPosition, additionalImages, additionalImageLabels, hideFromProductPage, customOptions, bundlePriceType, bundleSkuType, bundlePriceView, bundleWeightType, bundleValues, bundleShipmentType, associatedSkus, configurableVariations
    ] = row;
    const productObj = {
      title: name,
      storeViewCode,
      attributeSetCode,
      productType,
      productWebsites,
      taxClassName,
      visibility,
      specialPrice,
      specialPriceFromDate,
      specialPriceToDate,
      newFromDate,
      newToDate,
      displayProductOptionsIn,
      mapPrice,
      msrpPrice,
      mapEnabled,
      giftMessageAvailable,
      customDesign,
      customDesignFrom,
      customDesignTo,
      customLayoutUpdate,
      pageLayout,
      productOptionsContainer,
      msrpDisplayActualPriceType,
      countryOfManufacture,
      additionalAttributes,
      qty,
      outOfStockQty,
      useConfigMinQty,
      isQtyDecimal,
      allowBackorders,
      useConfigBackorders,
      minCartQty,
      useConfigMinSaleQty,
      maxCartQty,
      useConfigMaxSaleQty,
      isInStock,
      notifyOnStockBelow,
      useConfigNotifyStockQty,
      manageStock,
      useConfigManageStock,
      useConfigQtyIncrements,
      qtyIncrements,
      useConfigEnableQtyInc,
      enableQtyIncrements,
      isDecimalDivided,
      websiteId,
      relatedSkus,
      relatedPosition,
      crosssellSkus,
      crosssellPosition,
      upsellSkus,
      upsellPosition,
      additionalImages,
      additionalImageLabels,
      hideFromProductPage,
      customOptions,
      bundlePriceType,
      bundleSkuType,
      bundlePriceView,
      bundleWeightType,
      bundleValues,
      bundleShipmentType,
      associatedSkus,
      configurableVariations
    };

    productObj.isVisible = true;

    const productId = await createProductCsv(productObj);
    // eslint-disable-next-line no-console
    // TODO: Save categories
    // eslint-disable-next-line no-unused-vars
    const tags = categories;

    const productVariant = {};
    productVariant.sku = sku;
    productVariant.price = parseFloat(price);
    productVariant.isVisible = true;
    // productVariant.pricing = parseFloat(price);
    // productVariant.height = height;
    productVariant.length = parseFloat(length) || 0;
    productVariant.weight = parseFloat(weight) || 0;
    // productVariant.width = width;


    productVariant.metafields = [];
    // Add variantions as variantproduct.
    const configurableVariationsArr = configurableVariations.trim()
      ?.split("|");
    if (configurableVariationsArr.length && configurableVariations) {
      for (const conf of configurableVariationsArr) {
        const confArr = conf.split(",");
        for (const variation of confArr) {
          const subVar = variation.split("=");
          if (!subVar.length) {
            continue;
          }
          const [key, value] = subVar;
          if (key === "sku") {
            // eslint-disable-next-line prefer-destructuring
            productVariant.sku = subVar[1];
          } else {
            // TODO: Use metaifelds with attributes key for more custom attributes
            productVariant.attributeLabel = key;
            productVariant.optionTitle = value;
          }
        }
        // save productVariant
        // eslint-disable-next-line no-await-in-loop
        await createProductVariantCsv(productVariant, productId);
      }
    } else {
      // Save default variant for a simple product
      await createProductVariantCsv(productVariant, productId);
    }


    return productId;

    // TODO: add categories as tags.
    // TODO: Attach tags to product.

    // TODO: Add rest of the fields in product based on attribute code
  };


  const importFiles = async (newFiles) => {
    newFiles.map((file) => {
      const output = [];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        const parse = require("csv-parse");

        parse(reader.result, {
          trim: true,
          // eslint-disable-next-line camelcase
          skip_empty_lines: true
        })
          .on("readable", function () {
            let record;
            // eslint-disable-next-line no-cond-assign
            while (record = this.read()) {
              output.push(record);
            }
          })
          .on("end", async () => {
            // Skip first 2 rows.
            let titles = output[0];
            titles = titles.map((v, k) => _.camelCase(v));
            output.shift();

            // Process data rows.
            let tmpVariants = [];
            let currParentSku = "";
            const bulkCreateProductInput = [];

            for (let outputarray of output) {
              const values = outputarray;
              outputarray = titles.reduce((object, curr, i) => (object[curr] = values[i], object), {});
              console.log(outputarray, "outputarrayoutputarrayoutputarray");

              // Process Row Array
              // const productVariantSet = await mapAndInsertProduct(outputarray);
              const currSku = outputarray.sku;
              if (currParentSku == currSku) {
                // product
                outputarray.variants = tmpVariants;
                tmpVariants = [];
                currParentSku = "";
                outputarray = formatProductObj(outputarray);
                bulkCreateProductInput.push(outputarray);
              } else {
                // variant
                currParentSku = ("" + currSku).slice(0, -2);
                // eslint-disable-next-line no-console
                console.log(currParentSku, "currParentSku", currSku);
                tmpVariants.push(outputarray);
              }
            }

            try {
              // Save bulk products
              console.log(bulkCreateProductInput.length, "product length");
              await bulkCreateProduct(bulkCreateProductInput);
              // TODO:  Publish Products.
              // CHANGE schema response and and publish array of product ids.

              //End

            } catch (err) {
              // eslint-disable-next-line no-console
              console.log(err.message, " error in publishing-Catch");
            }

            enqueueSnackbar(i18next.t("admin.catalogProductPublishSuccess"), { variant: "success" });
            // eslint-disable-next-line no-console
            console.log(`Published total of ${productIds.length} products`);
            // setManualFilters(file.name, productIds);
            // setFilterByFileVisible(false);
            // setFiltered(true);
          })
          .on("error", () => {
            // eslint-disable-next-line no-console
            console.log("error happened");
            enqueueSnackbar(i18next.t("admin.productTable.bulkActions.error", { variant: "error" }));
          });
      };
      return;
    });
  };

  return (
    <Fragment>
      <Components.ProductPublish/>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Blocks region="VariantDetailHeader" blockProps={blockProps}/>
        </Grid>
        <Grid item sm={4}/>
        <Grid item sm={8} className={classes.importButton}>

          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Grid container spacing={2}>
                <Grid item sm={12}>
                  <ImportProductsByCsv
                    isFilterByFileVisible={true}
                    files={files}
                    getInputProps={getInputProps}
                    getRootProps={getRootProps}
                    importFiles={importFiles}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item sm={12}>
              <Grid container spacing={2}>
                <Grid item sm={12}>
                  <MuiCard>
                    <CardHeader
                      title={"Custom Actions"}
                    />
                    <CardContent>
                      <Button
                        color="primary"
                        variant="contained"
                        label="Import Data"
                        onClick={createProductCsv}
                      >
                        {i18next.t("admin.productDetailEdit.importButton") || "Import Data"}
                      </Button>
                      <Button
                        color="primary"
                        variant="contained"
                        label="Run Random Update"
                        onClick={randomUpdateProduct}
                        className={classes.updateBtn}
                      >
                        Random Update
                      </Button>
                    </CardContent>
                  </MuiCard>

                </Grid>
                {createProductError &&
                <Grid item sm={12}>
                  <InlineAlert
                    isDismissable
                    components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }}/> }}
                    alertType="error"
                    message={createProductError.message}
                  />
                </Grid>
                }
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Fragment>
  );
}

ProductImport.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles, { name: "RuiProductImport" })(ProductImport);
