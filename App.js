// NOTES: This file acts as an entry point into the Portal. From here, all of the components on the page will be called, and their URL paths would be set.
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import {
  ApplicationContent,
  Core,
  NotFound,
  Page,
  RequiresAuthentication,
  setClient,
  setUser,
  SignOut,
} from 'react-foundation';
import Headerbar from './app/Headerbar';
import 'react-foundation/dist/react-foundation.min.css';
// Routes
import AddKeywords from './adgroups/adGroup/AddKeywords';
import AddNegativeKeywords from './campaigns/campaign/AddNegativeKeywords';
import AddProducts from './campaigns/campaign/AddProducts';
import AddProductsDone from './campaigns/campaign/addProducts/StepDone';
import AdGroup from './adgroups/AdGroup';
import AdGroups from './AdGroups';
import AddTargets from './adgroups/adGroup/AddTargets';
import Campaign from './campaigns/Campaign';
import Campaigns from './Campaigns';
import Create from './campaigns/Create';
import CreateCampaignDone from './campaigns/create/Done';
import Dashboard from './Dashboard';
import Targeting from './Targeting';
import Optimizations from './Optimizations';
import Product from './products/Product';
import Products from './Products';
import Rebuild from './campaigns/campaign/Rebuild';
import StepAddKeywordsDone from './adgroups/adGroup/addKeywords/StepAddKeywordsDone';
import StepAddTargetsDone from './adgroups/adGroup/addTargets/StepAddTargetsDone';
import RebuildDone from './campaigns/campaign/rebuild/StepDone';
import UploadProducts from './products/UploadProducts';

class App extends Component {
  render() {
    const { setClient, setUser } = this.props;

    return (
      <BrowserRouter>
        <Page trackingCode={process.env.REACT_APP_GA_TRACKING_CODE}>
          <RequiresAuthentication
            appEnvironment={process.env.REACT_APP_ENVIRONMENT}
            applicationId={process.env.REACT_APP_APP_ID}
            authenticationDomain={process.env.REACT_APP_AUTHENTICATION_DOMAIN}
            callbackSetClient={setClient}
            callbackSetUser={setUser}
            cookieDomain={process.env.REACT_APP_COOKIE_DOMAIN}
            cookieSecurity={process.env.REACT_APP_COOKIE_SECURITY}
            platformOrchestrator={process.env.REACT_APP_PLATFORM_ORCHESTRATOR}
            region={process.env.REACT_APP_REGION}
            userpoolId={process.env.REACT_APP_USERPOOL_ID}
            webClientId={process.env.REACT_APP_WEB_CLIENT_ID}
          >
            <Core>
              <Headerbar />
              <ApplicationContent>
                <Switch>
                  {/* Default */}
                  <Route exact path="/">
                    <Redirect to="/dashboard" />
                  </Route>
                  <Route path="/dashboard" component={Dashboard} />
                  {/* Ad Groups */}
                  <Route exact path="/ad-groups" component={AdGroups} />
                  <Route path="/ad-groups/:adGroupId/add-keywords" component={AddKeywords} />
                  <Route path="/ad-groups/:adGroupId/add-targets" component={AddTargets} />
                  <Route exact path="/ad-groups/add-keywords/done" render={(props) => <StepAddKeywordsDone {...props} />} />
                  <Route exact path="/ad-groups/add-targets/done" render={(props) => <StepAddTargetsDone {...props} />} />
                  <Route path="/ad-groups/:adGroupId" component={AdGroup} />
                  {/* Campaigns */}
                  <Route exact path="/campaigns" component={Campaigns} />
                  <Route exact path="/campaigns/create" component={Create} />
                  <Route exact path="/campaigns/rebuild/done" component={RebuildDone} />
                  <Route exact path="/campaigns/create/done" render={(props) => <CreateCampaignDone {...props} />} />
                  <Route path="/campaigns/:campaignId/:campaignType/add-products/done" component={AddProductsDone} />
                  <Route path="/campaigns/:campaignId/:campaignType/add-negative-keywords" component={AddNegativeKeywords} />
                  <Route path="/campaigns/:campaignId/:campaignType/add-products" component={AddProducts} />
                  <Route path="/campaigns/:campaignId/:campaignType/rebuild" component={Rebuild} />
                  <Route path="/campaigns/:campaignId/:campaignType" component={Campaign} />
                  {/* Products */}
                  <Route exact path="/products" component={Products} />
                  <Route exact path="/products/upload" component={UploadProducts} />
                  <Route path="/products/:sku" component={Product} />
                  {/* Targeting */}
                  <Route exact path="/targeting" component={Targeting} />
                  {/* Optimization */}
                  <Route path="/optimizations" component={Optimizations} />
                  {/* Other */}
                  <Route path="/sign-out" component={SignOut} />
                  <Route component={NotFound} />
                </Switch>
              </ApplicationContent>
            </Core>
          </RequiresAuthentication>
        </Page>
      </BrowserRouter>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  setClient: (client) => dispatch(setClient(client)),
  setUser: (user) => dispatch(setUser(user)),
});

App = connect(
  null,
  mapDispatchToProps,
)(App);

export default App;
