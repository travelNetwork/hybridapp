import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import { colors } from '../../parameters';

export default class Spinner extends PureComponent {
  static propTypes = {
    ...ActivityIndicator.propTypes,
    color: PropTypes.string,
    visible: PropTypes.bool,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    overlay: PropTypes.bool,
  };

  static defaultProps = {
    color: colors.green,
    visible: false,
    overlay: false,
  }

  render() {
    const {
      visible, style, overlay, color, size,
    } = this.props;

    return (
      <View style={[visible && style, overlay && visible ? styles.overlay : {}]}>
        { visible && (
        <ActivityIndicator
          {...this.props}
          color={color}
          size={size || 'large'}
        />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.whiteTransparentLight,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
