import React from 'react';
import PropTypes from 'prop-types';
import sttJsonAdapter from '../../stt-adapters';
import { convertFromRaw, convertToRaw } from 'draft-js';
import { timecodeToSeconds } from '../../util/timecode-converter';
import SpeakerRowTimeLine from './speaker-row-timeline';

class SpeakerTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.resizableRectangleComponentHandles = {};
    this.dataBlocks= [];
    this.speakers = {},
    this.SEPERATE_RECTANGLE = 0.5;
    this.state = {
      mediaDuration: 0
    }
  }

  componentDidMount() {
    this.loadData();
  }

  shouldComponentUpdate = (nextProps, nextState) => {
  
    if(timecodeToSeconds(nextProps.mediaDuration) !== this.state.mediaDuration){
      this.setState({ mediaDuration: timecodeToSeconds(nextProps.mediaDuration) });
      return true;
    }

    if (nextProps !== this.props) return true;

    if (nextState !== this.state) return true;

    return false;
  };

  /**
   * update the start and end times of the speaker block in the timed-text-editor
   * @param {*Number} blockidx 
   * @param {*Number} newStartTime 
   * @param {*Number} newEndTime 
   */
updateStartAndEndTimes = (blockidx, newStartTime, newEndTime) => {
  const key = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent()).blocks[blockidx].key;
  this.props.timedTextEditorRef.current.setEditorNewContentTimes(key, newStartTime, newEndTime);
}

/**
 * 
 * @param {*Number} blockidx 
 * @param {object} contentToUpdate.entityMap - draftJs entity maps - used by convertFromRaw
 * @param {object} contentToUpdate.blocks - draftJs blocks - used by convertFromRaw
 * @param {*Number} newStartTime 
 * @param {*Number} newEndTime 
 * @returns {object} - {entityMap, blocks}
 */
exhangeTwoDataBlocks = (blockidx, contentToUpdate, newStartTime, newEndTime) => {
  const key = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent()).blocks[blockidx].key;
  return this.props.timedTextEditorRef.current.updateSpeakerSentenceTime(key, contentToUpdate, newStartTime, newEndTime);
}

getDataBlockTextByIndex(index){
  const text = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent()).blocks[index].text;
  return text;
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
    }

    exchangeRectanglesBlocks(firstIdx, secondIdx){
      
      const leftIdx = Math.min(firstIdx, secondIdx);
      const rightIdx = Math.max(firstIdx, secondIdx);
      
      // set there new positions
      // check the original idx and from right to left or left to right
      const rightNewStart = this.dataBlocks[leftIdx].start
      const rightRecInterval = this.dataBlocks[rightIdx].end - this.dataBlocks[rightIdx].start
      const leftRecInterval = this.dataBlocks[leftIdx].end - this.dataBlocks[leftIdx].start
      const leftNewStart = rightNewStart + rightRecInterval + this.SEPERATE_RECTANGLE;

      // set rectangles new positions
      this.resizableRectangleComponentHandles[leftIdx].setRectanglePosition(leftNewStart);
      this.resizableRectangleComponentHandles[rightIdx].setRectanglePosition(rightNewStart);

      // set rectangles new indecies
      this.resizableRectangleComponentHandles[leftIdx].blockIndexSetter(rightIdx);
      this.resizableRectangleComponentHandles[rightIdx].blockIndexSetter(leftIdx);

      // update the content state in timed-text-editor
      let ContentState = convertToRaw(this.props.timedTextEditorRef.current.state.editorState.getCurrentContent());
      ContentState = this.exhangeTwoDataBlocks(leftIdx, ContentState, leftNewStart, leftNewStart + leftRecInterval);  
      ContentState = this.exhangeTwoDataBlocks(rightIdx, ContentState, rightNewStart, rightNewStart + rightRecInterval);
      ContentState = this.props.timedTextEditorRef.current.reArrangeContentState(ContentState);
      this.props.timedTextEditorRef.current.setEditorContentState(ContentState);
      this.props.timedTextEditorRef.current.setEditorOriginalStateForNewTimeStateUpdate( convertToRaw(convertFromRaw(ContentState)));
      
      // set there new dataBlocks
      this.dataBlocks[leftIdx].start = leftNewStart;
      this.dataBlocks[leftIdx].end = leftNewStart + leftRecInterval;
      this.dataBlocks[rightIdx].start = rightNewStart;
      this.dataBlocks[rightIdx].end = rightNewStart + rightRecInterval;

      // exchange there blockData postion duo to change there indecies
      const tmpBlockData = this.dataBlocks[leftIdx];
      this.dataBlocks[leftIdx] = this.dataBlocks[rightIdx];
      this.dataBlocks[rightIdx] = tmpBlockData;

      // exchange there speakers indecies
      const tmpResizableRectangleComponentHandle = this.resizableRectangleComponentHandles[leftIdx];
      this.resizableRectangleComponentHandles[leftIdx] = this.resizableRectangleComponentHandles[rightIdx];
      this.resizableRectangleComponentHandles[rightIdx] = tmpResizableRectangleComponentHandle;

      // allow to update the rectangles
      this.resizableRectangleComponentHandles[leftIdx].setExternalUpdateToFalse();
      this.resizableRectangleComponentHandles[rightIdx].setExternalUpdateToFalse();
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
        resizableRectangleComponentHandles={this.resizableRectangleComponentHandles}
        checkCollision={this.checkCollision.bind(this)}
        updateRectangle={this.updateRectangle.bind(this)}
        exchangeRectanglesBlocks={this.exchangeRectanglesBlocks.bind(this)}
        updateStartAndEndTimes={this.updateStartAndEndTimes.bind(this)}
        getDataBlockTextByIndex={this.getDataBlockTextByIndex.bind(this)}
        />
        )
        )}
    </tr>
    );
  }
}

SpeakerTimeLine.propTypes = {
  transcriptData: PropTypes.object,
  videoRef: PropTypes.object.isRequired,
  mediaDuration: PropTypes.string,
  sttJsonType: PropTypes.string,
  timedTextEditorRef: PropTypes.object.isRequired,
};

export default SpeakerTimeLine;
