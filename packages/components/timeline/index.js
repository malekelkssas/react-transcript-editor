import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';


class TimeLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // playbackRate: 1,
      // rollBackValueInSeconds: this.props.rollBackValueInSeconds,
      // timecodeOffset: this.props.timecodeOffset,
      // hotKeys: returnHotKeys(this),
      // isPlaying: false,
      // playbackRateOptions: PLAYBACK_RATES,
      // previewIsDisplayed: true,
      // isMute: false
    };
  }

// (duration: in seconds, currentTime: in seconds)
  render() {
    const renderTimelineLines = () => {
      const currentTime  = this.props.currentTime;
      console.log("video time line",{currentTime});
        const lines = [];
        const duration = 1800;
        // const currentTime = 60;
        const totalLines = duration; // You can adjust the number of lines as needed
        
        
        
        for (let lineTime = 0; lineTime <= totalLines; lineTime++) {
          // const lineTime = (i / totalLines) * duration;
          const isActive = lineTime <= currentTime;

          const minute = lineTime / 60;

          const lineClassName = `${styles.timelineLine} ${isActive ? styles.timelineLineActive : ''}`;
          const numberClassName = `${styles.timelineNumber} ${isActive ? styles.timelineNumberActive : ''}`;

          const isMajorLine = (lineTime % 60) === 0;
          const isMinLine = (lineTime % 10) === 0;
          const lineStyle = {
            height: isMajorLine ? '10px' : '5px', // Adjust the length of the line
            marginLeft: 10
          };
          let width = 0;
    
          lines.push(
            <div key={lineTime} className={styles.timelineItem} style={{ left: `${((lineTime /totalLines))  * 98}%`}}>
              {isMinLine && <div className={lineClassName} style={lineStyle}/>}
              {isMajorLine && <div className={numberClassName}>{minute}</div>}
            </div>
          );

          width += 1;
        }
    
        return lines;
      };
    return (
      <div className={styles.timeline}>
        <div className={styles.timelineLinesContainer}>{renderTimelineLines()}</div>
      </div>
    );
  }
}

// VideoPlayer.propTypes = {
//   mediaUrl: PropTypes.string,
//   onTimeUpdate: PropTypes.func,
//   onClick: PropTypes.func,
//   videoRef: PropTypes.object.isRequired,
//   onLoadedDataGetDuration: PropTypes.func,
//   previewIsDisplayed: PropTypes.bool,
//   previewViewWidth: PropTypes.string
// };

export default TimeLine;
