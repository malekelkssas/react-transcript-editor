import React from 'react';
import styles from './index.module.css'
import PropTypes from 'prop-types';
import SpeakersCircularTimeLine from './speakers-circular-timeline';
import { secondsToTimecode, timecodeToSeconds } from '../../util/timecode-converter';


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

  handlePlayMedia = () => {
    const isPlaying = this.isPlaying();
    this.setState({ isPlaying }, () => isPlaying? this.playMedia():this.pauseMedia());
  };

  setCurrentTime = newCurrentTime => {
    if (newCurrentTime !== '' && newCurrentTime !== null) {
      const newCurrentTimeInSeconds = timecodeToSeconds(newCurrentTime);
      const videoRef = this.props.videoRef.current;

      if (videoRef.readyState === 4) {
        videoRef.currentTime = newCurrentTimeInSeconds;
        this.handlePlayMedia();
      }
    }
  };


  isPlaying = () => {
    return !this.props.videoRef.current.paused;
  };

  pauseMedia = () => {
    this.setState({ isPlaying: false }, () => this.props.videoRef.current.pause());

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'MediaPlayer',
        action: 'pauseMedia',
        name: 'pauseMedia',
        value: secondsToTimecode(this.props.videoRef.current.currentTime)
      });
    }
  };

  playMedia = () => {
    this.setState({ isPlaying: true }, () => this.props.videoRef.current.play());

    if (this.props.handleAnalyticsEvents) {
      this.props.handleAnalyticsEvents({
        category: 'MediaPlayer',
        action: 'playMedia',
        name: 'playMedia',
        value: secondsToTimecode(this.props.videoRef.current.currentTime)
      });
    }
  };

  render() {
    // console.log({transcriptData: this.props.transcriptData});

    
      if(this.props.transcriptData && this.props.transcriptData.blocks &&!this.state.speakers ){
        const tmpSpeakers = {};
        this.props.transcriptData.blocks.map((block) => {
          if(!tmpSpeakers.hasOwnProperty(block.data.speaker)){
            tmpSpeakers[block.data.speaker] = {};
          }
          if(!tmpSpeakers[block.data.speaker].hasOwnProperty(this.roundToNearest10(parseInt(block.data.start)))){
              const numberNearest10 = this.roundToNearest10(parseInt(block.data.start));
              tmpSpeakers[block.data.speaker][numberNearest10] =parseInt(block.data.start)};
          
        })
        this.setState({speakers: tmpSpeakers});
      }
     
    return (
      <div className={styles.SpeakersCircularTimeLineContainer} >
        {this.state.speakers && Object.keys(this.state.speakers).map((speaker) => (
         <>
         <SpeakersCircularTimeLine
         key={`speaker_${speaker}_circular_timeline`}
         mediaDuration={this.props.mediaDuration}
          speaker={speaker}
          startsObj={this.state.speakers[speaker]}
          setCurrentTime={this.setCurrentTime}
         />
         <div style={{width: `${(timecodeToSeconds(this.props.mediaDuration)/ 1800) * 95}%` ,borderBottom: "1px solid #ccc"}}/>
         </>
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
