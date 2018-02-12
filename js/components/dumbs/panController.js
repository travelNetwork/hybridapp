import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Animated, PanResponder } from 'react-native';

const ModePropType = PropTypes.oneOf(['decay', 'snap', 'spring-origin']);
const OvershootPropType = PropTypes.oneOf(['spring', 'clamp']);
const AnimatedPropType = PropTypes.any;

export default class PanController extends Component {
  static propTypes = {
      // Component Config
    lockDirection: PropTypes.bool,
    horizontal: PropTypes.bool,
    vertical: PropTypes.bool,
    overshootX: OvershootPropType,
    overshootY: OvershootPropType,
    xBounds: PropTypes.arrayOf(PropTypes.number),
    yBounds: PropTypes.arrayOf(PropTypes.number),
    xMode: ModePropType,
    yMode: ModePropType,
    snapSpacingX: PropTypes.number, // TODO: also allow an array of values?
    snapSpacingY: PropTypes.number,

      // Animated Values
    panX: AnimatedPropType,
    panY: AnimatedPropType,

      // Animation Config
    overshootSpringConfig: PropTypes.any,
    momentumDecayConfig: PropTypes.any,
    springOriginConfig: PropTypes.any,
    directionLockDistance: PropTypes.number,
    overshootReductionFactor: PropTypes.number,

      // Events
    onReleaseX: PropTypes.func,
    onReleaseY: PropTypes.func,
    onRelease: PropTypes.func,
    onIndexChange: PropTypes.func,
    onLevelChange: PropTypes.func,
  }

  static defaultProps = {
    horizontal: false,
    vertical: false,
    lockDirection: true,
    overshootX: 'spring',
    overshootY: 'spring',
    panX: new Animated.Value(0),
    panY: new Animated.Value(0),
    xBounds: [-Infinity, null, Infinity],
    yBounds: [-Infinity, null, Infinity],
    yMode: 'decay',
    xMode: 'decay',
    overshootSpringConfig: { friction: 9, tension: 40 },
    momentumDecayConfig: { deceleration: 0.993 },
    springOriginConfig: { friction: 7, tension: 40 },
    overshootReductionFactor: 3,
    directionLockDistance: 10,
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onIndexChange: () => true,
    onLevelChange: () => true,
  }

  _responder: null;
  _listener: null;
  _direction: null;

  componentWillMount() {
    this._responder = PanResponder.create({
      onStartShouldSetPanResponder: this.props.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this.props.onMoveShouldSetPanResponder,
      onPanResponderGrant: (...args) => {
        let { panX, panY, horizontal, vertical, xMode, yMode } = this.props;

        this.handleResponderGrant(panX, xMode);
        this.handleResponderGrant(panY, yMode);

        this._direction = horizontal && !vertical ? 'x' : (vertical && !horizontal ? 'y' : null);
      },

      onPanResponderMove: (_, { dx, dy, x0, y0 }) => {
        let {
            panX,
            panY,
            xBounds,
            yBounds,
            overshootX,
            overshootY,
            horizontal,
            vertical,
            lockDirection,
            directionLockDistance,
            } = this.props;

        if (!this._direction) {
          const dx2 = dx * dx;
          const dy2 = dy * dy;
          if (dx2 + dy2 > directionLockDistance) {
            this._direction = dx2 > dy2 ? 'x' : 'y';
          }
        }

        const dir = this._direction;

        if (horizontal && (!lockDirection || dir === 'x')) {
          let [xMin, xStep, xMax] = xBounds;

          this.handleResponderMove(panX, dx, xMin, xMax, overshootX);
        }

        if (vertical && (!lockDirection || dir === 'y')) {
          let [yMin, yStep, yMax] = yBounds;

          this.handleResponderMove(panY, dy, yMin, yMax, overshootY);
        }
      },

      onPanResponderRelease: (_, { vx, vy, dx, dy }) => {
        let {
            panX,
            panY,
            xBounds,
            yBounds,
            overshootX,
            overshootY,
            horizontal,
            vertical,
            lockDirection,
            xMode,
            yMode,
            snapSpacingX,
            snapSpacingY,
            } = this.props;

        let cancel = false;

        const dir = this._direction;

        if (!cancel && horizontal && (!lockDirection || dir === 'x')) {
          let [xMin, xStep, xMax] = xBounds;
          !cancel && this.handleResponderRelease(panX, xMin, xStep, xMax, vx, overshootX, xMode, snapSpacingX);
        }

        if (!cancel && vertical && (!lockDirection || dir === 'y')) {
          let [yMin, yStep, yMax] = yBounds;
          !cancel && this.handleResponderRelease(panY, yMin, yStep, yMax, vy, overshootY, yMode, snapSpacingY);
        }

        this._direction = horizontal && !vertical ? 'x' : (vertical && !horizontal ? 'y' : null);
      }
    });
  }

  handleResponderMove(anim, delta, min, max, overshoot) {
    let val = anim._offset + delta;

    if (val > max) {
      switch (overshoot) {
        case 'spring':
          val = max + (val - max) / this.props.overshootReductionFactor;
          break;
        case 'clamp':
          val = max;
          break;
      }
    }
    if (val < min) {
      switch (overshoot) {
        case 'spring':
          val = min - (min - val) / this.props.overshootReductionFactor;
          break;
        case 'clamp':
          val = min;
          break;
      }
    }
    val = val - anim._offset;
    anim.setValue(val);
  }

  handleResponderRelease(anim, min, step, max, velocity, overshoot, mode, snapSpacing) {
    anim.flattenOffset();

    if (anim._value < min) {
      switch (overshoot) {
        case 'spring':
          Animated.spring(anim, {
            // ...this.props.overshootSpringConfig,
            toValue: min,
            velocity,
          }).start(() => this.props.onLevelChange(min));
          break;
        case 'clamp':
          anim.setValue(min);
          break;
      }
    } else if (anim._value > max) {
      switch (overshoot) {
        case 'spring':
          Animated.spring(anim, {
            // ...this.props.overshootSpringConfig,
            toValue: max,
            velocity,
          }).start(() => this.props.onLevelChange(max));
          break;
        case 'clamp':
          anim.setValue(min);
          break;
      }
    } else {
      switch (mode) {
        case 'snap':
          this.handleSnappedScroll(anim, min, max, velocity, snapSpacing, overshoot);
          break;

        case 'decay':
          this.handleMomentumScroll(anim, min, step, max, velocity, overshoot);
          break;

        case 'spring-origin':
          Animated.spring(anim, {
            ...this.props.springOriginConfig,
            toValue: 0,
            velocity,
          }).start();
          break;
      }
    }
  }

  handleResponderGrant(anim, mode) {
    switch (mode) {
      case 'spring-origin':
        anim.setValue(0);
        break;
      case 'snap':
      case 'decay':
        anim.setOffset(anim._value + anim._offset);
        anim.setValue(0);
        break;
    }
  }

  handleMomentumScroll(anim, min, step, max, velocity, overshoot) {
    Animated.decay(anim, {
      ...this.props.momentumDecayConfig,
      velocity,
    }).start(() => {
      anim.removeListener(this._listener);
    });

    this._listener = anim.addListener(({ value }) => {
      anim.removeListener(this._listener);

      let toValue = min;

      if ((value < min) || (value < step && value < min + (step - min) / 2)) {
        toValue = min;
      } else if ((value > max) || (value > step && value > step + (max - step) / 2 ) ) {
        toValue = max;
      } else if ((value > step && value < step + (max - step) / 2)
        || (value < step && value > min + (step - min) / 2)) {
        toValue = step;
      }

      switch (overshoot) {
        case 'spring':
          Animated.spring(anim, {
            ...this.props.overshootSpringConfig,
            toValue,
            velocity,
          }).start(() => this.props.onLevelChange(toValue));
          break;
        case 'clamp':
          anim.setValue(toValue);
          break;
      }
    });
  }

  handleSnappedScroll(anim, min, max, velocity, spacing) {
    let endX = this.momentumCenter(anim._value, velocity, spacing);
    endX = Math.max(endX, min);
    endX = Math.min(endX, max);
    const bounds = [endX - spacing / 2, endX + spacing / 2];
    const endV = this.velocityAtBounds(anim._value, velocity, bounds);

    this._listener = anim.addListener(({ value }) => {
      if (value > bounds[0] && value < bounds[1]) {
        Animated.spring(anim, {
          toValue: endX,
          velocity: endV,
        }).start(() => this.props.onIndexChange(endX));
      }
    });

    Animated.decay(anim, {
      ...this.props.momentumDecayConfig,
      velocity,
    }).start(() => {
      anim.removeListener(this._listener);
    });
  }

  closestCenter(x, spacing) {
    const plus = (x % spacing) < spacing / 2 ? 0 : spacing;
    return Math.round(x / spacing) * spacing + plus;
  }

  momentumCenter(x0, vx, spacing) {
    let t = 0;
    const deceleration = this.props.momentumDecayConfig.deceleration || 0.997;
    let x1 = x0;
    let x = x1;

    while (true) {
      t += 16;
      x = x0 + (vx / (1 - deceleration)) *
      (1 - Math.exp(-(1 - deceleration) * t));
      if (Math.abs(x - x1) < 0.1) {
        x1 = x;
        break;
      }
      x1 = x;
    }
    return this.closestCenter(x1, spacing);
  }

  velocityAtBounds(x0, vx, bounds) {
    let t = 0;
    const deceleration = this.props.momentumDecayConfig.deceleration || 0.997;
    let x1 = x0;
    let x = x1;
    let vf;
    while (true) {
      t += 16;
      x = x0 + (vx / (1 - deceleration)) *
      (1 - Math.exp(-(1 - deceleration) * t));
      vf = (x - x1) / 16;
      if (x > bounds[0] && x < bounds[1]) {
        break;
      }
      if (Math.abs(vf) < 0.1) {
        break;
      }
      x1 = x;
    }
    return vf;
  }

  goToX(toValue) {
    const { panX } = this.props;

    Animated.spring(panX, {
      toValue
    }).start();
  }

  render() {
    return <View {...this.props} {...this._responder.panHandlers} />;
  }
}