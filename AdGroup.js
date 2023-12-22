// NOTES: This is what one of the components that the App.js file would call. This file can set state, display data in a table format, and have multiple buttons to linke to other operations that the application can do.
import React, { Component } from 'react';
import Request from 'shared/interceptors/Request';
import Skeleton from '@material-ui/lab/Skeleton';
import StatusEnum from 'shared/enum/StatusEnum';
import TargetingTypeEnum from 'shared/enum/TargetingTypeEnum';
import {
  Button,
  ContentHeader,
  Navtabs,
  NotFound,
  Separator,
  withSnackbar,
} from 'react-foundation';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import { setCampaign, setProducts } from 'redux/Wizard';
import DateRange from 'shared/components/DateRange';
import AdGroupContext from './AdGroupContext';
import Targeting from './adGroup/Targeting';
import NegativeTargeting from './adGroup/NegativeTargeting';
import ProductAds from './adGroup/ProductAds';
import Settings from './adGroup/Settings';
import Summary from './adGroup/Summary';
import formatDateForAmazon from '../../shared/formatDateForAmazon';

class AdGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      adGroup: {
        isAdGroupLoading: true,
      },
      isLoading: true,
      isMounted: true,
      isTargetTypeKeyword: true,
    };
  }

  componentDidMount() {
    this.requestData();
  }

  componentDidUpdate(prevProps) {
    const { dateRange } = this.props;
    const { startDate, endDate } = dateRange;

    if (prevProps.dateRange.startDate !== startDate
      || prevProps.dateRange.endDate !== endDate) {
      this.requestData();
    }
  }

  componentWillUnmount() {
    this.setState({
      isMounted: false,
    });
  }

  requestData = () => {
    this.setState({
      isLoading: true,
    });
    const { dateRange, enqueueSnackbar, match } = this.props;

    // convert date range to Amazon Date Format of YYYY-MM-DD
    const dates = formatDateForAmazon(dateRange);
    Request.get(`${process.env.REACT_APP_ORCHESTRATOR}/ad-group`, {
      params: {
        adGroupId: match.params.adGroupId,
        startDate: dates.startDate,
        endDate: dates.endDate,
      },
    })
      .then((result) => {
        const { isMounted } = this.state;
        if (isMounted && result.data.data) {
          const adGroupData = result.data.data;
          if (!adGroupData.assignedRuleset) {
            adGroupData.assignedRuleset = { rulesetId: 'No Ruleset' };
          }
          adGroupData.assignedRuleset.excludeFromGlobal = !adGroupData.assignedRuleset.excludeFromGlobal;
          this.setState({
            adGroup: adGroupData || {},
            isTargetTypeKeyword: adGroupData.isTargetTypeKeyword,
          });
        }
      })
      .catch((error) => {
        console.error(`Ad Group ${match.params.adGroupId}:`, error);
        enqueueSnackbar('Ad Group failed to load', {
          persist: true,
          variant: StatusEnum.ERROR,
        });
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  inManualCampaign = () => {
    const { adGroup } = this.state;

    return adGroup.campaign && adGroup.campaign.targetingType === TargetingTypeEnum.MANUAL;
  };

  addKeywords = () => {
    const { history, setCampaign, setProducts } = this.props;
    const { adGroup } = this.state;

    setCampaign({
      adGroupId: adGroup.adGroupId,
      adGroupName: adGroup.name,
      campaignId: adGroup.campaignId,
      campaignName: adGroup.campaign.name,
      defaultBid: adGroup.defaultBid,
    });

    adGroup.productAds.forEach((product) => {
      product.keywords = {};
    });

    setProducts(adGroup.productAds);

    history.push(`/ad-groups/${adGroup.adGroupId}/add-keywords`);
  };

  addTargets = () => {
    const { history, setCampaign, setProducts } = this.props;
    const { adGroup } = this.state;

    setCampaign({
      adGroupId: adGroup.adGroupId,
      adGroupName: adGroup.name,
      campaignId: adGroup.campaignId,
      campaignName: adGroup.campaign.name,
      defaultBid: adGroup.defaultBid,
    });

    adGroup.productAds.forEach((product) => {
      product.targets = {};
    });

    setProducts(adGroup.productAds);
    history.push(`/ad-groups/${adGroup.adGroupId}/add-targets`);
  }

  render() {
    const { match } = this.props;
    const { adGroup, isLoading, isTargetTypeKeyword } = this.state;
    const { path, url } = match;
    const links = [
      {
        title: 'Summary',
        href: `${url}/summary`,
      },
      {
        title: 'Settings',
        href: `${url}/settings`,
      },
      {
        title: 'Targeting',
        href: `${url}/targeting`,
      },
      {
        title: 'Negative Targeting',
        href: `${url}/negative-targeting`,
      },
      {
        title: 'Product Ads',
        href: `${url}/product-ads`,
      },
    ];

    return (
      <div>
        <ContentHeader title="Ad Group" subtitle={adGroup.name || <Skeleton variant="text" width={250} height={20} />} size="medium" color="white">
          <Button.Group size="small">
            {
              this.inManualCampaign()
              && (
                <div>
                  {
                    isTargetTypeKeyword
                      ? <Button rounded onClick={this.addKeywords} disabled={isLoading}>Add Keywords</Button>
                      : <Button rounded onClick={this.addTargets} disabled={isLoading}>Add Targets</Button>
                  }
                  <Separator />
                </div>
              )
            }
            <DateRange />
          </Button.Group>
        </ContentHeader>
        <Navtabs links={links} />
        <AdGroupContext.Provider value={{
          adGroup,
          isLoading,
          requestData: this.requestData,
        }}
        >
          <Switch>
            <Route exact path={path}>
              <Redirect to={`${url}/summary`} />
            </Route>
            <Route exact path={`${path}/summary`} component={Summary} />
            <Route exact path={`${path}/settings`} render={(props) => <Settings {...props} initialValues={adGroup} />} />
            <Route exact path={`${path}/targeting`} component={Targeting} />
            <Route exact path={`${path}/negative-targeting`} component={NegativeTargeting} />
            <Route exact path={`${path}/product-ads`} component={ProductAds} />
            <Route component={NotFound} />
          </Switch>
        </AdGroupContext.Provider>
      </div>
    );
  }
}

AdGroup = withSnackbar(AdGroup);

const mapStateToProps = (state) => ({
  dateRange: state.app.dateRange,
});

const mapDispatchToProps = (dispatch) => ({
  setCampaign: (campaign) => dispatch(setCampaign(campaign)),
  setProducts: (products) => dispatch(setProducts(products)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdGroup);
