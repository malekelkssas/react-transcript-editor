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

    return { start:this.roundToDecimalPlaces(wordNewStart, 2), end: this.roundToDecimalPlaces(wordNewEnd, 2) };
}



updateStartAndEndTimes = (blockidx, newStartTime, newEndTime) => {
  const data = sttJsonAdapter(
    this.props.transcriptData,
    this.props.sttJsonType
  );
  // const { data } = this.props.getEditorContent(this.props.autoSaveContentType);
  const { blocks, entityMap } = convertToRaw(convertFromRaw(data));
  const oldSentenceStart = blocks[blockidx].data.start;
  const oldSentenceEnd = blocks[blockidx].data.words[blocks[blockidx].data.words.length - 1].end;
  
  blocks[blockidx].data.start = newStartTime;
  blocks[blockidx].data.words.map((word, idx) => {
    const {start, end} = this.mapWordTimesToNewSentence(oldSentenceStart, oldSentenceEnd, newStartTime, newEndTime, word.start, word.end);
    const entityMapidx = word.index;
    word.start = blocks[blockidx].data.words[idx - 1]? blocks[blockidx].data.words[idx - 1].end : start;
    word.end = end;
    entityMap[entityMapidx].data.start = word.start;
    entityMap[entityMapidx].data.end = word.end;
    return word;
  });

  data.blocks = blocks;
  data.entityMap = entityMap;
  this.props.handleChangeContentTimeChangeBlocks(data);
}

  loadData(initData) {
      const { blocks } = convertToRaw(convertFromRaw(initData));
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
