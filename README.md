# VdcAngular10Skeleton

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate module module-name --route route-name --module app` to generate a new lazy loaded module. Run `ng generate component component-name` to generate a new component. 
You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## App content

### App has one main components:
1. [dashboard](https://github.com/EMBL-EBI-GCA/vdc_angular_skeleton/angular_10_skeleton/src/app/dashboard/component/dashboard.component.ts) - basic component, can be used as skeleton for other components
2. [non-found](https://github.com/EMBL-EBI-GCA/vdc_angular_skeleton/angular_10_skeleton/src/app/not-found/component/not-found.component.ts) - end-point for 404 page

### And two main folders:
1. [shared](https://github.com/EMBL-EBI-GCA/vdc_angular_skeleton/tree/angular_10_skeleton/src/app/shared) - contains [header](https://github.com/EMBL-EBI-GCA/vdc_angular_skeleton/tree/angular_10_skeleton/src/app/shared/header/header.component.ts) component (provides navbar for all components)

### Pre-installed packages:
1. [angular-material](https://www.npmjs.com/package/@angular/material). Provides angular material table
2. [bootstrap 4.5](https://www.npmjs.com/package/bootstrap) Provides bootstrap integration

### Basic dashboard component has:
1. Angular Material Design
2. Support for Bootstrap v4.5
3. Angular Material Table with pagination, sorting and filtering
4. Header
5. Grid-layout example

