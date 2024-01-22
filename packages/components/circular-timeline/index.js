import React from 'react';
import styles from './index.module.css'
import PropTypes from 'prop-types';
import SpeakersCircularTimeLine from './speakers-circular-timeline';
import sttJsonAdapter from '../../stt-adapters';


class CircularTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
      speakers: null,
    }

  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    if(!this.state.speakers && this.props.transcriptData){
      const { blocks } = sttJsonAdapter(
        this.props.transcriptData,
        this.props.sttJsonType
      );
      const tmpSpeakers = {};
      blocks.map((block) => {
        if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
          tmpSpeakers[block.data.speaker] = {};
        }
        if(!tmpSpeakers[block.data.speaker].hasOwnProperty(this.roundToNearest10(parseInt(block.data.start)))){
          const numberNearest10 = this.roundToNearest10(parseInt(block.data.start));
          tmpSpeakers[block.data.speaker][numberNearest10] =parseInt(block.data.start)};
        })
        this.setState({speakers: tmpSpeakers});
      }
  }

  
  roundToNearest10 = (number) => {
    return Math.floor(number / 10) * 10;
  };

  render() {
 
    return (
    <div className={styles.speakersCircularTimeLineContainer}>
      {this.state.speakers && Object.keys(this.state.speakers).map((speaker) => (
      <SpeakersCircularTimeLine
        key={`speaker_${speaker}_circular_timeline`}
        mediaDuration={this.props.mediaDuration}
        speaker={speaker}
        startsObj={this.state.speakers[speaker]}
        setCurrentTime={this.props.setCurrentTime}
        />
        )
        )}
    </div>
    );
  }
}

CircularTimeLine.propTypes = {
  transcriptData: PropTypes.object,
  handleAnalyticsEvents: PropTypes.func,
  videoRef: PropTypes.object.isRequired,
  mediaDuration: PropTypes.string,
  sttJsonType: PropTypes.string,
  setCurrentTime: PropTypes.func,
};

export default CircularTimeLine;
