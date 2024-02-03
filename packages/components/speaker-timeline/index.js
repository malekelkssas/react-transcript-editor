import React from 'react';
import PropTypes from 'prop-types';
import sttJsonAdapter from '../../stt-adapters';
import { convertFromRaw, convertToRaw } from 'draft-js';
import { timecodeToSeconds } from '../../util/timecode-converter';
import SpeakerRowTimeLine from './speaker-row-timeline';

class SpeakerTimeLine extends React.Component {
  constructor(props) {
    super(props);

    // TODO: make it object
    this.blockIndciesPositionsSetters = {};
    this.dataBlocks= [];
    this.speakers = {},
    this.state = {
      triggerChange: true,
      mediaDuration: 0
    }
  }

  componentDidMount() {
    this.loadData();
  }

  shouldComponentUpdate = (nextProps, nextState) => { 
    // TODO: check if the mediaUrl has changed
    let update = false;
    if(timecodeToSeconds(nextProps.mediaDuration) !== this.state.mediaDuration){
      this.setState({ mediaDuration: timecodeToSeconds(nextProps.mediaDuration) });
      update = true;
    }
    return update || nextState.triggerChange !== this.state.triggerChange || nextProps.transcriptData != this.props.transcriptData;
  };

  

  mapWordTimesToNewSentence(oldSentenceStart, oldSentenceEnd, newSentenceStart, newSentenceEnd, wordOldStart, wordOldEnd) {
    const relativePosition = (wordOldStart - oldSentenceStart) / (oldSentenceEnd - oldSentenceStart);
    const wordNewStart = newSentenceStart + relativePosition * (newSentenceEnd - newSentenceStart);
    const wordNewEnd = wordNewStart + (wordOldEnd - wordOldStart);

    return { start:wordNewStart, end: wordNewEnd };
}



updateStartAndEndTimes = (blockidx, newStartTime, newEndTime) => {
  const key = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent()).blocks[blockidx].key;
   this.props.timedTextEditorRef.current.updateSpeakerSentenceStartTime(key, newStartTime, newEndTime);
}

checkCollision(index, newStart, newEnd) {
  const prevRectangle = this.dataBlocks[index - 1];
  const nextRectangle = this.dataBlocks[index + 1];
  let IsCollied= false;
  let colliedRecIdx = -1;
  if(prevRectangle && prevRectangle.end > newStart){
    IsCollied = true;
    colliedRecIdx = index - 1;
  } else if (nextRectangle && nextRectangle.start < newEnd){
    IsCollied = true;
    colliedRecIdx = index + 1;
  }
  return  {IsCollied, colliedRecIdx};
}

updateRectangle(index, newStart, newEnd) {
  this.dataBlocks[index] = { ...this.dataBlocks[index], start: newStart, end: newEnd };
}

  loadData() {
      const { blocks } = convertToRaw(convertFromRaw(sttJsonAdapter(
        this.props.transcriptData,
        this.props.sttJsonType
      )));

      const tmpSpeakers = {};
      const dataBlocks = [];
      
      blocks.map((block, idx) => {
        const start = block.data.start;
        const end = block.data.words[block.data.words.length - 1].end;

        if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
          tmpSpeakers[block.data.speaker] = [];
        }

        tmpSpeakers[block.data.speaker].push(idx);
        dataBlocks.push({ start, end, text: block.text, index: idx, speaker: block.data.speaker });
        });

      this.dataBlocks= dataBlocks
      this.speakers = tmpSpeakers;
      this.setState({ triggerChange: !this.state.triggerChange  });
    }

    exchangeRectanglesBlocks(firstIdx, secondIdx){
      const leftIdx = Math.min(firstIdx, secondIdx);
      const rightIdx = Math.max(firstIdx, secondIdx);

      // set there new indecies
      this.blockIndciesPositionsSetters[leftIdx].blockIndexSetter(rightIdx);
      this.blockIndciesPositionsSetters[rightIdx].blockIndexSetter(leftIdx);
      
      // set there new positions
      const rightNewStart = this.dataBlocks[leftIdx].start
      const rightRecInterval = this.dataBlocks[rightIdx].end - this.dataBlocks[rightIdx].start
      const leftRecInterval = this.dataBlocks[leftIdx].end - this.dataBlocks[leftIdx].start
      const leftNewStart = rightNewStart + rightRecInterval;
      this.blockIndciesPositionsSetters[rightIdx].setRectanglePosition(rightNewStart);
      this.blockIndciesPositionsSetters[leftIdx].setRectanglePosition(leftNewStart + 0.5);
      
      // exhange there blockData postion
      this.dataBlocks[leftIdx].start = leftNewStart + 0.5;
      this.dataBlocks[leftIdx].end = leftNewStart + leftRecInterval;
      this.dataBlocks[rightIdx].start = rightNewStart;
      this.dataBlocks[rightIdx].end = rightNewStart + rightRecInterval;
      const tmpBlockData = this.dataBlocks[leftIdx];
      this.dataBlocks[leftIdx] = this.dataBlocks[rightIdx];
      this.dataBlocks[rightIdx] = tmpBlockData;

      const tmpBlockIndciesPositionsSetters = this.blockIndciesPositionsSetters[rightIdx];
      this.blockIndciesPositionsSetters[rightIdx] = this.blockIndciesPositionsSetters[leftIdx];
      this.blockIndciesPositionsSetters[leftIdx] = tmpBlockIndciesPositionsSetters;

    }

  render() {
    return (
    <tr>
    {Object.keys(this.speakers).map((speaker) => (
      <SpeakerRowTimeLine
        key={`speaker_${speaker}_circular_timeline`}
        mediaDuration={this.state.mediaDuration}
        speaker={speaker}
        rectanglesIndecies={this.speakers[speaker]}
        dataBlocks={this.dataBlocks}
        blockIndciesPositionsSetters={this.blockIndciesPositionsSetters}
        checkCollision={this.checkCollision.bind(this)}
        updateRectangle={this.updateRectangle.bind(this)}
        exchangeRectanglesBlocks={this.exchangeRectanglesBlocks.bind(this)}
        updateStartAndEndTimes={this.updateStartAndEndTimes.bind(this)}
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
