import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, Animated } from 'react-native';
import { View, Card, CardItem, Text, Button, Icon } from 'native-base';
import _ from 'lodash';
import shortid from 'shortid';

import { Showcase, Review } from '../review';
import BasicButton from '../basicButton';

import { entryStyles, BREAKPOINT1, BREAKPOINT2, ITEM_LEVEL1, ITEM_LEVEL2, TOOLBARHEIGHT, STATUSBARHEIGHT, SCREEN_PADDING_TOP } from './styles';

class Entry extends Component {

  static propTypes = {
    navigation: PropTypes.object,
    place: PropTypes.object.isRequired,
    scrollY: PropTypes.object
  };

  onPressAddReview = () => {
    this.props.navigation.navigate('AddReview', { place: this.props.place })
  }

  onPressEditReview(review) {
    this.props.navigation.navigate('AddReview', {
      place: this.props.place,
      review
    })
  }

  constructor(props) {
    super(props);

    const level1Y = props.scrollY.interpolate({
      inputRange: [BREAKPOINT2, BREAKPOINT1],
      outputRange: [0, -ITEM_LEVEL2],
      extrapolate: 'clamp',
    });

    let buttonY = props.scrollY.interpolate({
      inputRange: [BREAKPOINT2, BREAKPOINT1],
      outputRange: [0, BREAKPOINT1 - 50 - 80 + 2 - STATUSBARHEIGHT],
      extrapolate: 'clamp',
    });

    this.state = {
      level1Y,
      buttonY
    }
  }

  render () {
    const { level1Y, buttonY } = this.state;
    const { place: { name, types, scope, reviews, address }, selected } = this.props;
    let orderedReviews = [];

    const myReview = _.find(reviews, (review) => {
      return review.user_type === 'me';
    })

    if (scope === 'GOOGLE') {
      orderedReviews.push({
        created_by: {
          first_name: name
        },
        short_description: types ? types.join(', ') : '',
        categories: [],
        pictures: []
      })
    } else {
      const otherReviews = myReview ? _.filter(reviews, (review) => review.id !== myReview.id) : reviews;

      orderedReviews = _.compact(_.concat(_.compact([myReview]), otherReviews));
    }
    
    return (
      <ScrollView
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <Card style={entryStyles.card(selected)}>
          <Animated.View
            style={{
              transform: [
                { translateY: level1Y }
              ]
            }}
          >
            <Showcase
              style={entryStyles.showcase}
              reviews={orderedReviews}
              placeAddress={address}
            />
          </Animated.View>
          <Animated.View
          style={{
            zIndex: 99999,
            transform: [
              { translateY: buttonY }
            ]
          }}
          >
            {myReview ? (
              <BasicButton
                text='MY REVIEW'
                onPress={() => this.onPressEditReview(myReview)}>
              </BasicButton>
            ) : (
              <BasicButton
                text='ADD REVIEW'
                onPress={this.onPressAddReview}>
              </BasicButton>
            )}
          </Animated.View>
          <Animated.View
            style={{
              transform: [
                { translateY: level1Y }
              ]
            }}
          >
            <View style={entryStyles.addressWrapper}>
              <Text style={entryStyles.address}>
                <Icon style={entryStyles.addressIcon} name="md-pin" /> {address}
              </Text>
            </View>
            {orderedReviews && orderedReviews.map((review) => (
              <Review
                key={shortid.generate()}
                review={review} />
            ))}
          </Animated.View>
        </Card>
      </ScrollView>
    );
  }
}

export default Entry
