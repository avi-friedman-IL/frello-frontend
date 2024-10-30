import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import {
   loadBoards,
   addBoard,
   updateBoard,
   removeBoard,
} from '../store/actions/board.actions'

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'
import { boardService } from '../services/board'

import { BoardList } from '../cmps/BoardList'
import { AppHeader } from '../cmps/AppHeader'
import { StarredBoardsList } from '../cmps/StarredBoardsList'
import { loadUser, loadUsers } from '../store/actions/user.actions'
import { RingLoader } from 'react-spinners'
import { userService } from '../services/user'

export function BoardIndex() {
   const boards = useSelector(storeState => storeState.boardModule.boards)
   const isLoading = useSelector(storeState => storeState.boardModule.isLoading)
   const user = useSelector(storeState => storeState.userModule.user)

   const starredBoards = Array.isArray(boards)
      ? boards.filter(board => board.isStarred)
      : []

   useEffect(() => {
      if (user) loadUser(user._id)
      loadUsers()
      loadBoards({ createdBy: userService.getLoggedinUser() || null })
   }, [boards.length, user])

   async function onRemoveBoard(ev, boardId) {
      ev.preventDefault()
      ev.stopPropagation()
      try {
         await removeBoard(boardId)
         showSuccessMsg('Board removed')
      } catch (err) {
         showErrorMsg('Cannot remove board')
      }
   }

   async function onAddBoard(board) {
      const emptyBoard = boardService.getEmptyBoard()
      const boardToSave = {
         ...emptyBoard,
         members: [...emptyBoard.members, emptyBoard.createdBy],
         title: board.title,
         style: {
            ...emptyBoard.style,
            backgroundImage: board.backgroundImage,
         },
      }
      try {
         boardService.updateActivities(boardToSave, 'created this board', 'createBoard')
         boardService.updateActivities(boardToSave, 'added this board to', 'addBoard')
         const savedBoard = await addBoard(boardToSave)
         console.log(savedBoard)
         showSuccessMsg(`Board added (id: ${savedBoard._id})`)
      } catch (err) {
         showErrorMsg('Cannot add board')
      }
   }

   async function onUpdateBoard(ev, board) {
      ev.preventDefault()
      ev.stopPropagation()
      const title = prompt(board.title)
      board.title = title
      try {
         await updateBoard(board)
         showSuccessMsg('Board updated')
      } catch (err) {
         showErrorMsg('Cannot update board')
      }
   }

   if (isLoading) return <div className='loader'>{<RingLoader color='#0079bf' />}</div>
  //  if (!boards || !boards.length) return
   // console.log(import.meta.env.VITE_SERVER)
   return (
      <>
         <AppHeader
            starredBoards={starredBoards}
            borderBottom='1px solid #ddd'
            logoImg='https://cdn.icon-icons.com/icons2/2699/PNG/512/trello_logo_icon_167765.png'
            logoColor='#0c66e4'
            link={`${import.meta.env.VITE_SERVER}/`}
         />
         <section
            className='board-index'
            style={{
               gridTemplateColumns:
                  boards.length > 0 ? `minmax(1rem, 1fr) auto minmax(1rem, 1fr)` : '1',
               rowGap: '2em',
            }}>

            <StarredBoardsList
               starredBoards={starredBoards}
               onRemoveBoard={onRemoveBoard}
            />
            <BoardList
               boards={boards}
               starredBoards={starredBoards}
               onAddBoard={onAddBoard}
               onRemoveBoard={onRemoveBoard}
               onUpdateBoard={onUpdateBoard}
            />
         </section>
      </>
   )
}
