import React from 'react';
import PropTypes from 'prop-types';
import SpeakersCircularTimeLine from './speakers-circular-timeline';
// import { secondsToTimecode, timecodeToSeconds } from '../../util/timecode-converter';


class CircularTimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state= {
      speakers: null,
    }

  }

  
  roundToNearest10 = (number) => {
    return Math.floor(number / 10) * 10;
  };
  // these is a dublicate function from ./media-player.index.js {playMedia, setCurrentTime, isPlaying, pauseMedia, playMedia}
  // TODO: refactor 

  // handlePlayMedia = () => {
  //   const isPlaying = this.isPlaying();
  //   this.setState({ isPlaying }, () => isPlaying? this.playMedia():this.pauseMedia());
  // };

  // setCurrentTime = newCurrentTime => {
  //   if (newCurrentTime !== '' && newCurrentTime !== null) {
  //     const newCurrentTimeInSeconds = timecodeToSeconds(newCurrentTime);
  //     const videoRef = this.props.videoRef.current;

  //     if (videoRef.readyState === 4) {
  //       videoRef.currentTime = newCurrentTimeInSeconds;
  //       this.handlePlayMedia();
  //     }
  //   }
  // };


  // isPlaying = () => {
  //   return !this.props.videoRef.current.paused;
  // };

  // pauseMedia = () => {
  //   this.setState({ isPlaying: false }, () => this.props.videoRef.current.pause());

  //   if (this.props.handleAnalyticsEvents) {
  //     this.props.handleAnalyticsEvents({
  //       category: 'MediaPlayer',
  //       action: 'pauseMedia',
  //       name: 'pauseMedia',
  //       value: secondsToTimecode(this.props.videoRef.current.currentTime)
  //     });
  //   }
  // };

  // playMedia = () => {
  //   this.setState({ isPlaying: true }, () => this.props.videoRef.current.play());

  //   if (this.props.handleAnalyticsEvents) {
  //     this.props.handleAnalyticsEvents({
  //       category: 'MediaPlayer',
  //       action: 'playMedia',
  //       name: 'playMedia',
  //       value: secondsToTimecode(this.props.videoRef.current.currentTime)
  //     });
  //   }
  // };

  render() {
    // console.log({transcriptData: this.props.transcriptData});

    
      if(this.props.transcriptData && !this.state.speakers ){
        const tmpSpeakers = {};
        this.props.transcriptData.blocks.map((block) => {
          // tmpSpeakers.add(block.data.speaker);
          if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
            tmpSpeakers[block.data.speaker] = {};
          }
          if(!tmpSpeakers[block.data.speaker].hasOwnProperty(this.roundToNearest10(parseInt(block.data.start)))){
              const numberNearest10 = this.roundToNearest10(parseInt(block.data.start));
              tmpSpeakers[block.data.speaker][numberNearest10] =parseInt(block.data.start)};
          
        })
        console.log("tmpSpeakers", tmpSpeakers);
        this.setState({speakers: tmpSpeakers});
      }

      // for (const key in myObject) {
      //   if (myObject.hasOwnProperty(key)) {
      //     console.log(`Key: ${key}, Value: ${myObject[key]}`);
      //   }
      // }

      // mySet.has(numberToCheck)
      // const mySet = new Set(myArray);
     
    return (
      <div>
        {this.state.speakers && Object.keys(this.state.speakers).map((speaker) => (
         <SpeakersCircularTimeLine
         mediaDuration={this.props.mediaDuration}
          speaker={speaker}
          startsObj={this.state.speakers[speaker]}
          currentTime={this.props.currentTime}
         />
        )
         )}
      </div>
    );
  }
}

CircularTimeLine.propTypes = {
  currentTime: PropTypes.number,
  videoRef: PropTypes.object.isRequired,
  handleAnalyticsEvents: PropTypes.func,
  mediaDuration: PropTypes.string
};

export default CircularTimeLine;
