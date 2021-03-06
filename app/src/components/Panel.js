import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CardActions from './../actions/CardActions';
import PanelActions from "../actions/PanelActions";
import Cards from './Cards';
import Edit from './Edit';
import { connect } from 'react-redux';
import * as Types from './../constants/Types';
import { DragSource, DropTarget } from "react-dnd";

class Panel extends Component {
  static propTypes = {
    createCard: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
  };

  constructor(props){
    super(props);

    this.handleCreateCard = this.handleCreateCard.bind(this);
    this.handleDeleteCard = this.handleDeleteCard.bind(this);
    this.handleDeletePanel = this.handleDeletePanel.bind(this);
  }

  /** Criação de um novo componente Card */
  handleCreateCard(){
    const {id} = this.props.panel;
    this.props.createCard(id);
  }

  /** Deletando o componente Card por ID */
  handleDeleteCard(cardID){
    const panelID = this.props.panel.id;
    this.props.deleteCard(panelID, cardID);
  }

  /** Deletando Panel por ID */
  handleDeletePanel(panelID){
    const {cards} = this.props.panel;
    this.props.deletePanel(panelID);

    cards.forEach(card => this.props.deleteCard(panelID, card));
  }

  render(){
    const {cards, panel, connectDragPreview, connectDragSource, connectDropTarget} = this.props;
    const filterCards = panel.cards.map(id => cards.find(card => card.id===id)).filter(card => card);

    return connectDragPreview(
        connectDropTarget(
            <div className="col-md-3">
              { connectDragSource(
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <Edit
                          id={ panel.id }
                          edit={ panel.edit }
                          text={ panel.text }
                          ToEdit={ this.props.editPanel }
                          editComponent={ this.props.editPanel }
                          deleteComponent={ this.handleDeletePanel }
                      />
                    </div>
                    <div className="panel-body">
                      <Cards
                          cards={ filterCards }
                          ToEdit={ this.props.editCard }
                          editCard={ this.props.editCard }
                          deleteCard={ this.handleDeleteCard }
                          moveCard={ this.props.moveCard }
                      />
                    </div>
                    <div className="panel-footer">
                      <button className="btn btn-primary btn-delete" onClick={ this.handleCreateCard }>
                        <i className="ion-plus-round"></i> Tarefa
                      </button>
                    </div>
                  </div>
              ) }
            </div>
        )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cards: state.cards
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    /** No momento de criar o Card, atribui ele ao Panel */
    createCard: (panel_id) => {
      const createNewCard = CardActions.createCard('Nova Tarefa Criada');
      dispatch(createNewCard);
      const {id} = createNewCard.payload;
      dispatch(PanelActions.insertInPanel(panel_id, id))
    },

    editCard: (id, value) => {
      const edited = {id};

      if(!value) {
        edited.edit = true;
      } else {
        edited.edit = false;
        edited.text = value;
      }

      dispatch(CardActions.editCard(edited))
    },

    deleteCard: (panelID, cardID) => {
      dispatch(CardActions.deleteCard(cardID));
      if(!panelID) {
        return
      }
      return dispatch(PanelActions.removeFromPanel(panelID, cardID));
    },
    movePanel: (id, monitor_id) => dispatch(PanelActions.movePanel(id, monitor_id)),
    insertInPanel: (id, monitor_id) => dispatch(PanelActions.insertInPanel(id, monitor_id)),
    moveCard: (id, monitor_id) => dispatch(PanelActions.moveCard(id, monitor_id)),
  }
};

/** Drag and Drop */
const dragDropSrc = {
  beginDrag(props){
    return {
      id: props.panel.id
    }
  }
};

const collect = (connnect, monitor) => ({
  connectDragSource: connnect.dragSource(),
  isDragging: monitor.isDragging(),
  connectDragPreview: connnect.dragPreview()
});

const collectTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget()
});

const panelHoverTarget = {
  hover(props, monitor){
    const {id, cards} = props.panel;
    const monitorProps = monitor.getItem();
    const monitorType = monitor.getItemType();
    const monitor_id = monitorProps.id;

    if(id!==monitor_id&&Types.PANEL===monitorType) {
      return props.movePanel(id, monitor_id)
    }

    if(!cards.length&&Types.CARD===monitorType) {
      return props.insertInPanel(id, monitor_id);
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(
    DragSource(Types.PANEL, dragDropSrc, collect)(
        DropTarget([Types.CARD, Types.PANEL], panelHoverTarget, collectTarget)(Panel)
    )
)
