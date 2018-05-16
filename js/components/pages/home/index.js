import React, { Component } from 'react';
import { StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shortid from 'shortid';

import Carousel from './carousel';
import Marker from '../../dumbs/marker';
import MarkerPosition from '../../dumbs/markerPosition';
import Button from '../../dumbs/button';
import Text from '../../dumbs/text';
import Icon from '../../dumbs/icon';
import Filters from '../../dumbs/filters';
import Badge from '../../dumbs/badge';
import Map from '../../map';
import Search from './search';

import { levelChange, getGeolocation, regionChanged, filtersChange, placeSelect } from '../../../actions/home';
import { selectPlaces } from '../../../reducers/home';
import { placeDetails } from '../../../api/search';

import { sizes, carousel } from '../../../parameters';

class Home extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    navigation: PropTypes.object,
    selectedPlace: PropTypes.object,
    places: PropTypes.array,
    geolocation: PropTypes.object,
    level: PropTypes.number,
    region: PropTypes.object,
    filters: PropTypes.object,
    categories: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {
      addThisPlace: false,
      panY: new Animated.Value(-carousel.level1),
      filtersVisible: false,
    };
  }

  componentDidMount() {
    if (this.props.level) {
      this._carousel.goToLevel(this.props.level);
    }
  }

  componentWillReceiveProps({ level, geolocation }) {
    if (geolocation && geolocation.location
        && !geolocation.loading && this.props.geolocation.loading) {
      this._map.fitToCoordinates([geolocation.location], {
        edgePadding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
      });
      this.setState({ addThisPlace: true });
    }

    if (level && level !== this.props.level) {
      this._map.updatePadding({
        top: sizes.toolbarHeight,
        bottom: level === 1 ? carousel.level1 : carousel.level2,
      });

      if (level === 2 && this.props.selectedPlace) {
        this._map.animateToCoordinate(this.props.selectedPlace);
      }
    }
  }

  onMarkerPress = (place) => {
    this.props.dispatch(placeSelect(place));
  }

  onIndexChange = (place) => {
    console.log('yo ?', place);
    this.props.dispatch(placeSelect(place));

    if (this.props.level === 2) {
      this._map.animateToCoordinate(place);
    }
  }

  onLevelChange = (level) => {
    this.props.dispatch(levelChange(level));
  }

  onRegionChange = (region) => {
    this.props.dispatch(regionChanged(region));
  }

  onMapLongPress = () => {
    // Nearby search
  }

  onHeaderPress = () => {
    const toLevel = (this.props.level <= 2) ? this.props.level === 1 ? 2 : 1 : null;
    if (toLevel) {
      this._carousel.goToLevel(toLevel);
      this.onLevelChange(toLevel);
    }
  }

  onPoiClick = (poi) => {
    placeDetails(poi.placeId)
      .then(response => response.json())
      .then(({ result }) => {
      });
  }

  onPanDrag = () => {
    if (this.state.addThisPlace) {
      this.setState({ addThisPlace: false });
    }
  }

  onFiltersPress = () => {
    if (this.state.filtersVisible) {
      this._carousel.goToLevel(this.props.level);
    } else {
      this._carousel.goToLevel(1);
    }
    this.setState({ filtersVisible: !this.state.filtersVisible });
  }

  onFiltersChange = ({ categories }) => {
    this.props.dispatch(filtersChange(categories));
  }

  onAddPlace = () => {
    this.onMapLongPress({ coordinate: this.props.geolocation.location });
  }

  onLocationPress = () => {
    this.props.dispatch(getGeolocation());
  }

  onSearchClear = () => {
  }

  onReviewPress = (place) => {
    this.onFiltersChange({ categories: [] });
    this.props.dispatch(placeSelect(place));
    this._map.animateToCoordinate(place);
    this._carousel.goToLevel(2);
    this.onLevelChange(2);
  }

  zoomOut = () => {
    this._map.zoomBy(-4);
  }

  render() {
    const {
      navigation, places, region, categories, filters, geolocation, selectedPlace,
    } = this.props;
    const {
      addThisPlace, panY, filtersVisible,
    } = this.state;

    return (
      <Search
        onClear={this.onSearchClear}
        onMenuPress={() => navigation.navigate('DrawerOpen')}
        onReviewPress={this.onReviewPress}
      >
        {addThisPlace && (
          <Button
            style={styles.addPlaceButton}
            onPress={this.onAddPlace}
            fab
          >
            <Text>Add this place</Text>
          </Button>
        )}
        <Map
          ref={(m) => { this._map = m; }}
          moveOnMarkerPress={false}
          onLongPress={this.onMapLongPress}
          region={region}
          onRegionChangeComplete={this.onRegionChange}
          mapPadding={{
            top: sizes.toolbarHeight,
            bottom: carousel.level1,
          }}
          onPoiClick={this.onPoiClick}
          onPanDrag={this.onPanDrag}
        >
          {places.map(place => (
            <Marker
              key={shortid.generate()}
              place={place}
              selected={selectedPlace && selectedPlace.id === place.id}
              onMarkerPress={this.onMarkerPress}
            />
          ))}
          {geolocation && geolocation.location && (
            <MarkerPosition
              location={geolocation.location}
              onMarkerPress={location => this.onMapLongPress({ coordinate: location })}
            />
          )}
        </Map>
        <Carousel
          ref={(c) => {
            if (c) { this._carousel = c.getWrappedInstance(); }
          }}
          onIndexChange={this.onIndexChange}
          onLevelChange={this.onLevelChange}
          onHeaderPress={this.onHeaderPress}
          navigation={navigation}
          panY={panY}
        />

        <Animated.View
          style={[
            styles.buttonControls,
            { transform: [{ translateY: panY }] },
          ]}
          pointerEvents="box-none"
        >
          <Button
            fab
            icon="zoom-out-map"
            style={styles.zoomOut}
            onPress={this.zoomOut}
          />
          <Button fab icon="my-location" onPress={this.onLocationPress} />
        </Animated.View>
        <Filters
          list={categories}
          style={styles.filters}
          visible={filtersVisible}
          onFiltersChange={this.onFiltersChange}
        >
          <Animated.View
            style={[
              styles.filterButtonWrapper,
              { transform: [{ translateY: panY }] },
            ]}
            pointerEvents="box-none"
          >
            <Button
              fab
              style={styles.filterButton}
              onPress={this.onFiltersPress}
            >
              <Text>Filters</Text>
              {filters.categories.length ? (
                <Badge text={filters.categories.length} />
              ) : (
                <Icon name="equalizer" set="SimpleLineIcons" />
              )}
            </Button>
          </Animated.View>
        </Filters>
      </Search>
    );
  }
}

const bindActions = dispatch => ({
  dispatch,
});

const mapStateToProps = state => ({
  selectedPlace: state.home.selectedPlace,
  places: selectPlaces(state),
  categories: state.entities.categories,
  geolocation: state.home.geolocation,
  level: state.home.level,
  region: state.home.region,
  filters: state.home.filters,
});

export default connect(mapStateToProps, bindActions)(Home);

const styles = StyleSheet.create({
  addPlaceButton: {
    marginTop: 28,
    borderRadius: 2,
    height: 40,
    alignSelf: 'center',
    zIndex: 1,
  },
  filters: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    paddingTop: 20,
  },
  zoomOut: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  buttonControls: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flex: 1,
    padding: 14,
  },
  filterButtonWrapper: {
    position: 'absolute',
    bottom: 0,
    height: 56,
    alignItems: 'center',
    width: '100%',
    flex: 1,
    marginBottom: 8,
    zIndex: 1,
  },
  filterButton: {
    height: 40,
  },
});
