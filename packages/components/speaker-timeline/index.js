import React from 'react';
import styles from './index.module.css'
import PropTypes from 'prop-types';
import SpeakerRowTimeLine from './speaker-row-timeline';
import sttJsonAdapter from '../../stt-adapters';
import { timecodeToSeconds } from '../../util/timecode-converter';


class SpeakerTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
      speakers: null,
      hasLoadedData: false,
    }

  }

  componentDidMount() {
    this.loadData();
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    return timecodeToSeconds(nextProps.mediaDuration) !== timecodeToSeconds(this.props.mediaDuration) || nextProps.transcriptData != this.props.transcriptData;
  };

  loadData() {
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
          tmpSpeakers[block.data.speaker][numberNearest10] = parseInt(block.data.start)};
        })
        this.setState({speakers: tmpSpeakers, hasLoadedData: true});
  }

  
  roundToNearest10 = (number) => {
    return Math.floor(number / 10) * 10;
  };

  render() {
    return (
    <div className={styles.speakerRowTimeLineContainer}>
      {this.state.speakers && Object.keys(this.state.speakers).map((speaker) => (
      <SpeakerRowTimeLine
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

SpeakerTimeLine.propTypes = {
  transcriptData: PropTypes.object,
  handleAnalyticsEvents: PropTypes.func,
  videoRef: PropTypes.object.isRequired,
  mediaDuration: PropTypes.string,
  sttJsonType: PropTypes.string,
  setCurrentTime: PropTypes.func,
};

export default SpeakerTimeLine;
