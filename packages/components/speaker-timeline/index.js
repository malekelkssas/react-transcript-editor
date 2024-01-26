import React from 'react';
import PropTypes from 'prop-types';
import SpeakerRowTimeLine from './speaker-row-timeline';
import sttJsonAdapter from '../../stt-adapters';


class SpeakerTimeLine extends React.Component {
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
      const { blocks } = sttJsonAdapter(
        this.props.transcriptData,
        this.props.sttJsonType
      );
      const tmpSpeakers = {};
      blocks.map((block) => {
        if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
          tmpSpeakers[block.data.speaker] = {};
          tmpSpeakers[block.data.speaker].rectangles = [];
        }
        const start = block.data.start;
        const end = block.data.words[block.data.words.length - 1].end;
        tmpSpeakers[block.data.speaker].rectangles.push({ start, end, text: block.text });
        });
        Object.keys(tmpSpeakers).map((speaker) =>{
          tmpSpeakers[speaker].rectangles.sort((a,b) => a.start - b.start);
        });
      this.setState({speakers: tmpSpeakers});
    }

  render() {
    return (
    <tr>
      {this.state.speakers && Object.keys(this.state.speakers).map((speaker) => (
      <SpeakerRowTimeLine
        key={`speaker_${speaker}_circular_timeline`}
        mediaDuration={this.props.mediaDuration}
        speaker={speaker}
        rectangles={this.state.speakers[speaker].rectangles}
        setCurrentTime={this.props.setCurrentTime}
        />
        )
        )}
    </tr>
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
