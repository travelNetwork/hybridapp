import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Animated, View, StyleSheet, Share,
} from 'react-native';
import _ from 'lodash';

import { inviteFriendsEvent } from '../../../libs/mixpanel';

import Entry from '../../dumbs/entry';
import EmptyEntry from '../../dumbs/emptyEntry';
import PanController from '../../dumbs/panController';

import { placeSelect } from '../../../actions/home';
import { selectVisiblePlaces } from '../../../reducers/home';

import { sizes, carousel } from '../../../parameters';

class Carousel extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigation: PropTypes.object,
    visiblePlaces: PropTypes.array,
    selectedPlace: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    gPlace: PropTypes.object,
    panY: PropTypes.object,
    hidden: PropTypes.bool,
    onAddLocationPress: PropTypes.func,
  };

  static defaultProps = {
    hidden: false,
  }

  constructor(props) {
    super(props);

    this._carousel = React.createRef();
  }

  componentWillReceiveProps({ selectedPlace, hidden }) {
    if (selectedPlace && !selectedPlace.noCarouselUpdate
      && !this.props.selectedPlace !== selectedPlace) {
      const index = selectedPlace
        ? _.compact([this.props.gPlace, ...this.props.visiblePlaces])
          .findIndex(d => d.id === selectedPlace)
        : 0;

      this.goToIndex(index);
    }

    if (hidden !== this.props.hidden) {
      this.toggleVisibility(!hidden);
    }
  }

  shouldComponentUpdate({ visiblePlaces, gPlace }) {
    return (
      !_.isEqual(visiblePlaces, this.props.visiblePlaces)
      || !_.isEqual(gPlace, this.props.gPlace)
    );
  }

  _onIndexChange = (index) => {
    const { visiblePlaces, gPlace } = this.props;
    const place = (gPlace && !index)
      ? gPlace
      : visiblePlaces[index - (gPlace ? '1' : 0)];

    this.props.dispatch(placeSelect({
      ...place,
      noCarouselUpdate: true,
    }));
  }

  _onLayout = () => {
    const index = this.props.selectedPlace
      ? this.props.visiblePlaces.findIndex(place => place.id === this.props.selectedPlace) : 0;

    if (index !== -1) {
      this.goToIndex(index);
    } else {
      this.goToIndex(0);
    }
  }

  _onCarouselDidUpdate = () => {
    const { selectedPlace, visiblePlaces, gPlace } = this.props;
    const index = selectedPlace
      ? _.compact([gPlace, ...visiblePlaces]).findIndex(d => d.id === selectedPlace)
      : -1;

    this._carousel.current.toIndex(index, index < 0, index < 0);
  }

  _onSharePress = () => {
    Share.share({
      message: `Hi!
Join me in Nowmad and lets start sharing the best places for travelling around the world !
See you soon on Nowmad !
https://play.google.com/store/apps/details?id=com.nowmad`,
    });
    inviteFriendsEvent({ sharedFrom: 'Empty State' });
  }

  toggleVisibility = (visible = true) => {
    Animated.timing(this.props.panY, {
      duration: 200,
      toValue: visible ? -carousel.level2 : -carousel.level1,
      useNativeDriver: true,
    }).start();
  }

  goToIndex(index) {
    this._carousel.current.toIndex(index);
  }

  render() {
    const {
      panY, visiblePlaces, gPlace, onAddLocationPress,
    } = this.props;

    return (
      <PanController
        ref={this._carousel}
        style={styles.carousel}
        horizontal
        lockDirection
        panY={panY}
        onIndexChange={this._onIndexChange}
        onComponentDidUpdate={this._onCarouselDidUpdate}
        snapSpacingX={entryWidth}
      >
        {(!visiblePlaces || !visiblePlaces.length) && !gPlace && (
          <View
            style={styles.entryWrapper}
          >
            <EmptyEntry
              onAddLocationPress={onAddLocationPress}
              onSharePress={this._onSharePress}
            />
          </View>
        )}
        {gPlace && (
          <View
            style={styles.entryWrapper}
          >
            <Entry
              gPlace
              navigation={this.props.navigation}
            />
          </View>
        )}
        {visiblePlaces && visiblePlaces.map(place => (
          <View
            key={place.id}
            style={styles.entryWrapper}
          >
            <Entry
              placeId={place.id}
              navigation={this.props.navigation}
            />
          </View>
        ))}
      </PanController>
    );
  }
}

const bindActions = dispatch => ({
  dispatch,
});

const mapStateToProps = state => ({
  visiblePlaces: selectVisiblePlaces(state),
  selectedPlace: state.home.selectedPlace,
  gPlace: state.home.gPlace,
});

export default connect(mapStateToProps, bindActions, null, { withRef: true })(Carousel);

const entryMargin = 8;
const entryWidth = sizes.width - (entryMargin * 2);

const styles = StyleSheet.create({
  carousel: {
    position: 'absolute',
    top: sizes.height,
    alignItems: 'center',
    paddingLeft: 8,
  },
  buttonWrapper: {
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 14,
    width: sizes.width,
  },
  entryWrapper: {
    width: entryWidth,
    paddingHorizontal: (entryMargin / 2),
  },
});
