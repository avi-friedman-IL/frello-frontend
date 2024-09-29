import { boardService } from '../../services/board'
import { store } from '../store'
import {
  ADD_BOARD,
  REMOVE_BOARD,
  SET_BOARDS,
  SET_BOARD,
  UPDATE_BOARD,
  ADD_BOARD_MSG,
  SET_FILTER,
  SET_LOADING,
} from '../reducers/board.reducer'

export async function loadBoards(filterBy = {}) {
  store.dispatch({ type: SET_LOADING, isLoading: true })
  try {
    const boards = await boardService.query(filterBy)
    store.dispatch(getCmdSetBoards(boards))
  } catch (err) {
    console.log('Cannot load boards', err)
    throw err
  } finally {
    setTimeout(() => {
    store.dispatch({ type: SET_LOADING, isLoading: false })
    }, 1000)
  }
}

export async function loadBoard(boardId, filterBy = {}) {
  store.dispatch({ type: SET_LOADING, isLoading: true })
  console.log('loadBoard')
  try {
    const board = await boardService.getById(boardId, filterBy)
    store.dispatch(getCmdSetBoard(board))
  } catch (err) {
    console.log('Cannot load board', err)
  } finally {
    setTimeout(() => {
    store.dispatch({ type: SET_LOADING, isLoading: false })
    }, 1000)
  }
}

export async function removeBoard(boardId) {
  try {
    await boardService.remove(boardId)
    store.dispatch(getCmdRemoveBoard(boardId))
  } catch (err) {
    console.log('Cannot remove board', err)
    throw err
  }
}

export async function addBoard(board) {
  try {
    const savedBoard = await boardService.save(board)
    store.dispatch(getCmdAddBoard(savedBoard))
    return savedBoard
  } catch (err) {
    console.log('Cannot add board', err)
    throw err
  }
}

export async function updateBoard(board) {
  try {
    const savedBoard = await boardService.save(board)

    store.dispatch(getCmdUpdateBoard(savedBoard))
  } catch (err) {
    console.log('Cannot save board', err)
    throw err
  }
}

export async function addBoardMsg(boardId, txt) {
  try {
    const msg = await boardService.addBoardMsg(boardId, txt)
    store.dispatch(getCmdAddBoardMsg(msg))
    return msg
  } catch (err) {
    console.log('Cannot add board msg', err)
    throw err
  }
}

export function filterBoard(filterBy) {
  store.dispatch({ type: SET_FILTER, filterBy })
}

// Command Creators:
function getCmdSetBoards(boards) {
  return {
    type: SET_BOARDS,
    boards,
  }
}
function getCmdSetBoard(board) {
  return {
    type: SET_BOARD,
    board,
  }
}
function getCmdRemoveBoard(boardId) {
  return {
    type: REMOVE_BOARD,
    boardId,
  }
}
function getCmdAddBoard(board) {
  return {
    type: ADD_BOARD,
    board,
  }
}
function getCmdUpdateBoard(board) {
  return {
    type: UPDATE_BOARD,
    board,
  }
}
function getCmdAddBoardMsg(msg) {
  return {
    type: ADD_BOARD_MSG,
    msg,
  }
}

export async function removeTask(taskId) {
  try {
    await boardService.removeTask(taskId)
    // store.dispatch(getCmdRemoveTask(boardId))
  } catch (err) {
    console.log('Cannot remove board', err)
    throw err
  }
}

// unitTestActions()
async function unitTestActions() {
  await loadBoards()
  await addBoard(boardService.getEmptyBoard())
  await updateBoard({
    _id: 'm1oC7',
    title: 'Board-Good',
  })
  await removeBoard('m1oC7')
  // TODO unit test addBoardMsg
}
