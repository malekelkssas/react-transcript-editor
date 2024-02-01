import React from 'react';
import PropTypes from 'prop-types';
import SpeakerRowTimeLine from './speaker-row-timeline';
import sttJsonAdapter from '../../stt-adapters';
import { convertFromRaw, convertToRaw } from 'draft-js';
import { timecodeToSeconds } from '../../util/timecode-converter';


class SpeakerTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
      speakers: null,
    }
  }

  componentDidMount() {
    this.loadData(sttJsonAdapter(
      this.props.transcriptData,
      this.props.sttJsonType
    ));
  }

  shouldComponentUpdate = (nextProps) => {
  
    return timecodeToSeconds(nextProps.mediaDuration) !== timecodeToSeconds(this.props.mediaDuration) || nextProps.transcriptData != this.props.transcriptData;
  };

  roundToDecimalPlaces(number, decimalPlaces) {
    const roundedNumber = Number(number.toFixed(decimalPlaces));
    return roundedNumber;
  }

  mapWordTimesToNewSentence(oldSentenceStart, oldSentenceEnd, newSentenceStart, newSentenceEnd, wordOldStart, wordOldEnd) {
    const relativePosition = (wordOldStart - oldSentenceStart) / (oldSentenceEnd - oldSentenceStart);
    const wordNewStart = newSentenceStart + relativePosition * (newSentenceEnd - newSentenceStart);
    const wordNewEnd = wordNewStart + (wordOldEnd - wordOldStart);

    return { start:wordNewStart, end: wordNewEnd };
}



updateStartAndEndTimes = (blockidx, newStartTime, newEndTime) => {
  console.log("updateStartAndEndTimes", blockidx, newStartTime, newEndTime);
  const ke = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent()).blocks[blockidx].key;
  console.log(this.props.timedTextEditorRef.current);
  const contentToUpdateWithSpekaerSentenceStartTime = this.props.timedTextEditorRef.current.updateSpeakerSentenceStartTime(ke, newStartTime);
  this.props.timedTextEditorRef.current.setEditorNewTimeStateUpdate(contentToUpdateWithSpekaerSentenceStartTime);
}

  loadData(initData) {
      const { blocks } = convertToRaw(convertFromRaw(initData));
      // console.log("blocks", blocks);
      const tmpSpeakers = {};
      blocks.map((block, idx) => {
        if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
          tmpSpeakers[block.data.speaker] = {};
          tmpSpeakers[block.data.speaker].rectangles = [];
        }
        const start = block.data.start;
        const end = block.data.words[block.data.words.length - 1].end;
        tmpSpeakers[block.data.speaker].rectangles.push({ start, end, text: block.text, key: idx });
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
        updateStartAndEndTimes={this.updateStartAndEndTimes}
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
