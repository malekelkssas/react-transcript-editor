import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
import { secondsToTimecode, timecodeToSeconds } from '../../util/timecode-converter';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from '@fortawesome/free-solid-svg-icons';

class TimeLine extends React.Component {
  constructor(props) {
    super(props);

  }

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

    const renderTimelineLines = () => {
      const MINUTE_TO_SECONDS = 60;
      const MINUTE_SEGMENT = 10;
      const mediaDuration = timecodeToSeconds(this.props.mediaDuration);
      const totalLines = mediaDuration;
      const lines = [];
      for (let lineTime = 0; lineTime <= totalLines; lineTime++) {
        const isActive = lineTime <= this.props.currentTime;
        const minute = lineTime / MINUTE_TO_SECONDS;

        const lineClassName = `${styles.timeLineLine} ${isActive ? styles.timeLineLineActive : ''}`;
        const numberClassName = `${styles.timeLineNumber} ${isActive ? styles.timeLineNumberActive : ''}`;
        
        const isMajorLine = (lineTime % MINUTE_TO_SECONDS) === 0;
        const isMinLine = (lineTime % MINUTE_SEGMENT) === 0;
        const lineStyle = {
          height: isMajorLine ? '10px' : '5px', 
          
        };
        // TODO: timeLineItem, timeLineNumber
        lines.push(
            <div style={{display: "flex", flexDirection:"column", alignItems: "end", marginLeft: `0.5px`, maxHeight:"20px"}}>
          <div key={`min-line-${lineTime}`} style={{minHeight: "10px", marginTop:"7px", cursor: 'pointer'}} onClick={()=>this.setCurrentTime(lineTime)}>
            {isMinLine && <div className={lineClassName} style={lineStyle}/>}
          </div> 
            <div key={`major-line-${lineTime}`} style={{minHeight: "10px", marginTop:"7px", maxWidth:"1px",  cursor: 'pointer'}} onClick={()=>this.setCurrentTime(lineTime)}>
            {isMajorLine && <div className={numberClassName} >{minute}</div>}
            </div> 
            </div>
          );
        }
    
        return lines;
      };


     
    return (
      <tr className={styles.tableRow} >
        <td className={styles.tableIcon}>
        <div style={{ maxWidth: "3em", minWidth:"3em"}}>
          <FontAwesomeIcon icon={faClock} />
          </div>
        </td>
        <td className={styles.timeLine}>
              {this.props.videoRef && <div style={{display: "flex", flexDirection:"row", position:"relative"}}>{renderTimelineLines()}</div>}
      </td>
      </tr>
    );
  }
}

TimeLine.propTypes = {
  currentTime: PropTypes.number,
  videoRef: PropTypes.object.isRequired,
  handleAnalyticsEvents: PropTypes.func,
  mediaDuration: PropTypes.string
};

export default TimeLine;
