import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectFullPlace } from '../../../reducers/entities';
import Review from './review';
import Icon from '../icon';


import { colors, carousel } from '../../../parameters';

class Entry extends Component {
  static propTypes = {
    navigation: PropTypes.object,
    me: PropTypes.object,
    place: PropTypes.object.isRequired,
  };

  addOrEditReview = (myReview = false) => () => {
    this.props.navigation.navigate('AddReview', {
      place: this.props.place,
      review: myReview,
    });
  }

  placeDetails = () => {
    this.props.navigation.navigate('PlaceDetails', {
      place: this.props.place,
    });
  }

  render() {
    const { place: { reviews }, me } = this.props;
    const myReview = me ? _.find(reviews, r => r.created_by.id === me.id) : null;
    const review = myReview || reviews[0];
    const pictures = _.flatten(reviews.map(r => r.pictures));
    const categories = _.uniqWith(_.flatten(reviews.map(r => r.categories)), _.isEqual);
    const others = _.compact(reviews.map(r => (r.id !== review.id ? r.created_by : null)));

    return (
      <View style={styles.card}>
        <Review
          onPress={this.placeDetails}
          review={{
            ...review,
            categories,
            pictures,
          }}
          others={others}
          cover
        />
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.6}
          onPress={this.addOrEditReview(myReview)}
        >
          <Icon
            name={myReview ? 'edit' : 'playlist-add'}
            style={[
              styles.cta_icon,
              myReview && styles.cta_edit,
            ]}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state, props) => {
  const placeSelector = selectFullPlace();

  return {
    place: placeSelector(state, props.place.id),
    me: state.auth.me,
  };
};

export default connect(mapStateToProps)(Entry);

const styles = StyleSheet.create({
  card: {
    height: carousel.level2,
    backgroundColor: colors.white,
    position: 'relative',
    borderColor: colors.green,
    borderTopWidth: carousel.border,
    borderRadius: 2,
    elevation: 3,
  },
  cta: {
    backgroundColor: colors.yellowTransparent,
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 64,
    width: 64,
    borderTopRightRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingRight: 10,
  },
  cta_icon: {
    color: colors.white,
    fontSize: 32,
  },
  cta_edit: {
    fontSize: 28,
  },
});
