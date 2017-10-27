import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
} from 'react-native';

import MapView from 'react-native-maps';
import PanController from './PanController';
import PriceMarker from './AnimatedPriceMarker';

const screen = Dimensions.get('window');

const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;

const ITEM_SPACING = 10;
const ITEM_PREVIEW = 10;
const ITEM_WIDTH = screen.width - (2 * ITEM_SPACING) - (2 * ITEM_PREVIEW);
const SNAP_WIDTH = ITEM_WIDTH + ITEM_SPACING;
const ITEM_PREVIEW_HEIGHT = 80;
const BREAKPOINT1 = screen.height;

function getMarkerState(panX, panY, scrollY, i) {
  const xLeft = (-SNAP_WIDTH * i) + (SNAP_WIDTH / 2);
  const xRight = (-SNAP_WIDTH * i) - (SNAP_WIDTH / 2);
  const xPos = -SNAP_WIDTH * i;

  const isIndex = panX.interpolate({
    inputRange: [xRight - 1, xRight, xLeft, xLeft + 1],
    outputRange: [0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  const translateY = Animated.multiply(isIndex, panY);

  const translateX = panX;

  const anim = Animated.multiply(isIndex, scrollY.interpolate({
    inputRange: [0, BREAKPOINT1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  }));

  return {
    translateY,
    translateX,
    anim
  };
}

class AnimatedViews extends React.Component {
  constructor(props) {
    super(props);

    const panX = new Animated.Value(0);
    const panY = new Animated.Value(0);

    const scrollY = panY.interpolate({
      inputRange: [-1, 1],
      outputRange: [1, -1],
    });

    const scrollX = panX.interpolate({
      inputRange: [-1, 1],
      outputRange: [1, -1],
    });

    const translateY = scrollY.interpolate({
      inputRange: [0, BREAKPOINT1],
      outputRange: [0, -100],
      extrapolate: 'clamp',
    });

    const markers = [
      {
        id: 0,
        amount: 99,
        coordinate: {
          latitude: LATITUDE,
          longitude: LONGITUDE,
        },
      },
      {
        id: 1,
        amount: 199,
        coordinate: {
          latitude: LATITUDE + 0.004,
          longitude: LONGITUDE - 0.004,
        },
      },
      {
        id: 2,
        amount: 285,
        coordinate: {
          latitude: LATITUDE - 0.004,
          longitude: LONGITUDE - 0.004,
        },
      },
    ];

    const animations = markers.map((m, i) =>
      getMarkerState(panX, panY, scrollY, i));

    this.state = {
      panX,
      panY,
      animations,
      index: 0,
      canMoveHorizontal: true,
      scrollY,
      scrollX,
      translateY,
      markers,
      aboutToMove: false
    };
  }

  componentDidMount() {
    const { panX, panY, scrollX, markers } = this.state;

    panX.addListener(this.onPanXChange);
    panY.addListener(this.onPanYChange);
  }

  onStartShouldSetPanResponder = (e) => {
    // we only want to move the view if they are starting the gesture on top
    // of the view, so this calculates that and returns true if so. If we return
    // false, the gesture should get passed to the map view appropriately.
    const { panY } = this.state;
    const { pageY } = e.nativeEvent;
    const topOfMainWindow = ITEM_PREVIEW_HEIGHT - panY.__getValue();
    const topOfTap = screen.height - pageY - 56;

    console.log('topOfTap', topOfTap);
    console.log('topOfMainWindow', topOfMainWindow);
    console.log('topOfTap < topOfMainWindow', topOfTap < topOfMainWindow);
    if (topOfTap < topOfMainWindow) {
      this.setState({aboutToMove: true})
    }

    return topOfTap < topOfMainWindow;
  }

  onMoveShouldSetPanResponder = (e) => {
    const { panY } = this.state;
    const { pageY } = e.nativeEvent;
    const topOfMainWindow = ITEM_PREVIEW_HEIGHT - panY.__getValue();
    const topOfTap = screen.height - pageY - 56;

    return topOfTap < topOfMainWindow;
  }

  onRelease = (e) => {
    this.setState({aboutToMove: false})
  }

  onPanXChange = ({ value }) => {
    const { index } = this.state;
    const newIndex = Math.floor(((-1 * value) + (SNAP_WIDTH / 2)) / SNAP_WIDTH);
    if (index !== newIndex) {
      this.setState({ index: newIndex });
    }
  }

  onPanYChange = ({ value }) => {
    // const { canMoveHorizontal, region, scrollY, scrollX, markers, index } = this.state;
    // const shouldBeMovable = Math.abs(value) < 2;
    // if (shouldBeMovable !== canMoveHorizontal) {
    //   this.setState({ canMoveHorizontal: shouldBeMovable });
    // }
  }

  render() {
    const {
      panX,
      panY,
      animations,
      canMoveHorizontal,
      markers,
      aboutToMove
    } = this.state;

    const top = null;

    return (
      <View style={styles.container}>
        <PanController
          style={styles.container}
          vertical
          horizontal={canMoveHorizontal}
          xMode="snap"
          snapSpacingX={SNAP_WIDTH}
          yBounds={[-1 * screen.height, 0]}
          xBounds={[-screen.width * (markers.length - 1), 0]}
          panY={panY}
          panX={panX}
          onStartShouldSetPanResponder={this.onStartShouldSetPanResponder}
          onMoveShouldSetPanResponder={this.onMoveShouldSetPanResponder}
          onRelease={this.onRelease}
        >
          <MapView.Animated
            provider={this.props.provider}
            style={styles.map}
          />
          <View style={styles.itemContainer(aboutToMove, top)}>
            {markers.map((marker, i) => {
              const {
                translateY,
                translateX,
              } = animations[i];

              return (
                <Animated.View
                  key={marker.id}
                  style={[styles.item, {
                    transform: [
                      { translateY },
                      { translateX },
                    ],
                  }]}
                />
              );
            })}
          </View>
        </PanController>
      </View>
    );
  }
}

AnimatedViews.propTypes = {
  provider: MapView.ProviderPropType,
};

const styles = {
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  itemContainer: (aboutToMove, height) => {
    let position = null
    if (aboutToMove) {
      position = {
        paddingTop: screen.height - ITEM_PREVIEW_HEIGHT - 56
      }
    } else {
      position = {
        top: screen.height - ITEM_PREVIEW_HEIGHT - 56,
      }
    }

    return {
      backgroundColor: 'transparent',
      flexDirection: 'row',
      paddingHorizontal: (ITEM_SPACING / 2) + ITEM_PREVIEW,
      position: 'absolute',
      ...position
    }
  },
  map: {
    backgroundColor: 'transparent',
    ...StyleSheet.absoluteFillObject,
  },
  item: {
    width: ITEM_WIDTH,
    height: screen.height + (2 * ITEM_PREVIEW_HEIGHT),
    backgroundColor: 'red',
    marginHorizontal: ITEM_SPACING / 2,
    overflow: 'hidden',
    borderRadius: 3,
    borderColor: '#000',
  },
};

module.exports = AnimatedViews;
