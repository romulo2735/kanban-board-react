import * as ActionsTypes from './../constants/ActionsTypes';

/**
 * @param state
 * @param action
 */
export default function cards(state = [], action){
  switch(action.type) {
    case ActionsTypes.CREATE_CARD:
      return [...state, action.payload];
      break;

    case ActionsTypes.EDIT_CARD:
      return state.map(card => {
        const {id} = action.payload;

        if(id===card.id) {
          return Object.assign({}, card, action.payload)
        }
        return card;
      });
      break;

    case ActionsTypes.DELETE_CARD:
      const {id} = action.payload;
      return state.filter(card => id!==card.id);
      break;

    default:
      return state;
  }
}
