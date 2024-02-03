import React, { Component } from 'react';
import PropTypes from 'prop-types';
import style from './index.module.css';

class DraggableResizableRectangle extends Component {
  constructor(props) {
    super(props);

    this.initialMouseX = null;
    this.initialPosition = null;
    this.initialSize = null;
    this.MINUTE_WIDTH = 65;
    this.MINUTE_TO_SECOND = 60;
    this.MIN_RECTANGLE_WIDTH = 0.99;
    this.X_OFFSET = 3;
    this.ACTIONS = {
      DRAG: 'drag',
      RESIZE: 'resize',
    };
    this.DRAG_SPEED = 1;
    this.RESIZE_SPEED = 1;
    this.timeoutId = null;
    this.blockIndex = this.props.blockIndex;
    this.index = this.props.index;
    this.checkCollision = false;
    this.externalUpdate = false;
    this.state = {
      position: { x: this.mapFromTimeToPosition(this.props.startTime) },
      size: { width: Math.max(this.mapFromTimeToPosition(this.props.endTime) - this.mapFromTimeToPosition(this.props.startTime), this.MIN_RECTANGLE_WIDTH)},
      isDragging: false,
      isResizing: false,
      text: this.props.text,
    };
  }
  blockIndexSetter(newIndex){
    this.blockIndex = newIndex;
  }

  setRectanglePosition(startTime){
    this.externalUpdate = true;
    this.setState({
      position: {
        x: this.mapFromTimeToPosition(startTime),
      },
    });
  }
  
  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    this.props.blockIndciesPositionsSetters[this.blockIndex] = {blockIndexSetter: this.blockIndexSetter.bind(this), setRectanglePosition: this.setRectanglePosition.bind(this)};
  }
  
  
  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  setExternalUpdateToFalse(){
    this.externalUpdate = false;
  }
  
  // TODO: check the new text if changed
  componentDidUpdate(prevProps, prevState) {
    if (prevState.position.x !== this.state.position.x || prevState.size.width !== this.state.size.width) {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        const newUpdate = {
          index: this.index,
          start: this.mapFromPositionToTime(this.state.position.x),
          end: this.mapFromPositionToTime(
            this.getRectangleBoundryPosition(this.state.position.x, this.state.size.width).endX
          ),
          setExternalUpdateToFalse: this.setExternalUpdateToFalse.bind(this)
        };
        this.props.updateQueue.push(newUpdate);
        this.index = this.blockIndex;
        }, 3000);
    }
  }
    
    getRectangleBoundryPosition = (x, width) => {
      return { startX: x, endX: x + width };
    }

    handleMouseDown = (event, type) => {
      event.preventDefault();
      
    if (type === this.ACTIONS.DRAG) {
      this.setState({ isDragging: true });
    } else if (type === this.ACTIONS.RESIZE) {
      this.setState({ isResizing: true });
    }

    this.initialMouseX = event.clientX;
    this.initialPosition = this.state.position.x;
    this.initialSize = this.state.size.width;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  mapFromTimeToPosition(time){
    return Math.max(((time / this.MINUTE_TO_SECOND) * this.MINUTE_WIDTH) + this.X_OFFSET, this.X_OFFSET);
  }

  mapFromPositionToTime(position){
    return Math.max(((position - this.X_OFFSET) / this.MINUTE_WIDTH) * this.MINUTE_TO_SECOND, 0);
  }

  handleMouseMove = (event) => {
    const { isDragging, isResizing } = this.state;
    const { clientX } = event;
    if (!this.externalUpdate){
      if (isDragging) { 
        const movementX = clientX - this.initialMouseX;
        const newXPosition = this.initialPosition + movementX * this.DRAG_SPEED;
        const {startX, endX} = this.getRectangleBoundryPosition(newXPosition, this.initialSize);
        const startTime = this.mapFromPositionToTime(startX);
        const endTime = this.mapFromPositionToTime(endX);
        if(startX >= 0 && endTime <= this.props.mediaDuration) {
          
          const collision = this.props.checkCollision(this.blockIndex, startTime , endTime );
          if( !collision.IsCollied || (collision.IsCollied && this.checkCollision) ){
            if(collision.IsCollied){
              this.props.exchangeRectanglesBlocks(this.blockIndex, collision.colliedRecIdx);
              document.removeEventListener('mousemove', this.handleMouseMove);
              document.removeEventListener('mouseup', this.handleMouseUp);
            } else{
            this.setState({
              position: {
                x: startX,
              },
            });
            this.props.updateRectangle(this.blockIndex, startTime, endTime);
            }
            this.checkCollision = false;
          } else if (collision.IsCollied){
              this.checkCollision = true;
          }
        }
      } else if (isResizing) {
        const movementX = clientX - this.initialMouseX;
        const newSize = Math.max(this.initialSize + movementX * this.RESIZE_SPEED, this.MIN_RECTANGLE_WIDTH);
        const {startX, endX} = this.getRectangleBoundryPosition(this.initialPosition, newSize);
        const startTime = this.mapFromPositionToTime(startX);
        const endTime = this.mapFromPositionToTime(endX);
        if(startX >= 0 && endTime <= this.props.mediaDuration) {
        const collision = this.props.checkCollision(this.blockIndex, startTime , endTime );
        if(!collision.IsCollied){
        this.setState({
          size: {
            width: newSize,
          },
        });
        this.props.updateRectangle(this.blockIndex, startTime, endTime);
      }
    }
  }
    }
  };

  handleMouseUp = () => {
    this.setState({
      isDragging: false,
      isResizing: false,
    });

    this.initialMouseX = null;
    this.initialPosition = null;
    this.initialSize = null;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  render() {
    const { position, size, isResizing } = this.state;
    
    return (
      <div
        style={{
          left: position.x,
          width: size.width,
          cursor: isResizing ? 'ew-resize' : 'move',
        }}
        className={style.rectangleContainer}
        title={this.props.text}
      >
        <div
        className={style.dragContainer}
          onMouseDown={(e) => this.handleMouseDown(e, this.ACTIONS.DRAG)}
        >
          <span className={style.dragContainerText}>
            {this.props.text}
          </span>
        </div>
        <div
        style={{backgroundColor: this.blockIndex % 2 === 0 ? "#3498db": "#043c69"}}
          className={style.resizer}
          onMouseDown={(e) => this.handleMouseDown(e, this.ACTIONS.RESIZE)}
        />
      </div>
    );
  }
}

DraggableResizableRectangle.propTypes = {
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  blockIndex: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  checkCollision: PropTypes.func.isRequired,
  updateRectangle: PropTypes.func.isRequired,
  mediaDuration: PropTypes.number.isRequired,
  exchangeRectanglesBlocks: PropTypes.func.isRequired,
  updateQueue: PropTypes.array.isRequired,
  blockIndciesPositionsSetters: PropTypes.object.isRequired,
};

export default DraggableResizableRectangle;
