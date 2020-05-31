import "./templates/productAdmin.html";
import "./templates/productAdmin.js";
import "./blocks";

import React from "react";
import CubeIcon from "mdi-material-ui/Cube";
import { registerOperatorRoute } from "/imports/client/ui";

import ProductsTable from "./components/ProductsTable";
import ProductDetailLayout from "./layouts/ProductDetail";
import ProductImport from "./components/ProductImport";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

registerOperatorRoute({
  LayoutComponent: null,
  MainComponent: ProductDetailLayout,
  path: "/products/:handle/:variantId?/:optionId?"
});

registerOperatorRoute({
  group: "navigation",
  priority: 60,
  LayoutComponent: null,
  MainComponent: ProductImport,
  // eslint-disable-next-line react/display-name
  SidebarIconComponent: (props) => <CubeIcon {...props} />,
  sidebarI18nLabel: "admin.imports",
  path: "/import"
});


registerOperatorRoute({
  group: "navigation",
  priority: 20,
  LayoutComponent: ContentViewExtraWideLayout,
  path: "/products",
  MainComponent: ProductsTable,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <CubeIcon {...props} />,
  sidebarI18nLabel: "admin.products"
});
