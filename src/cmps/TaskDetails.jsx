import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { Edit } from './Edit'
import { LabelList } from './LabelList'
import { TaskChecklist } from './TaskChecklist'
import { updateBoard } from '../store/actions/board.actions'
import { TaskDetailsActions } from './TaskDetailsActions'
import { MemberList } from './MemberList'
import { boardService } from '../services/board'
import SvgIcon from './SvgIcon'
import { DueDateDisplay } from './DueDateDisplay'
import { AttachmentList } from './AttachmentList'
import { IoAddOutline } from 'react-icons/io5'
import { CoverDisplay } from './CoverDisplay'
import { FaRegCreditCard } from 'react-icons/fa'
import { VscListFlat } from 'react-icons/vsc'

export function TaskDetails() {
  const dialogRef = useRef(null)
  const params = useParams()
  const navigate = useNavigate()

  const { boardId, groupId, taskId } = params
  const board = useSelector(storeState => storeState.boardModule.board)
  const group = board?.groups?.find(group => group.id === groupId)
  const task = group?.tasks?.find(task => task.id === taskId)

  const [currElToEdit, setCurrElToEdit] = useState('')
  const [boardSelectedLabels, setBoardSelectedLabels] = useState(board.labels)
  const [taskSelectedLabels, setTaskSelectedLabels] = useState(task.labels)
  const [newDueDate, setNewDueDate] = useState(task.dueDate)
  const [newChecklists, setNewCheckLists] = useState(task.checklists)
  const [newFiles, setNewFiles] = useState(task.attachments || [])
  const [currCover, setCurrCover] = useState(task.cover)
  const [taskMembers, setTaskMembers] = useState(task.members)

  const [anchorEl, setAnchorEl] = useState(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [modalOpenByName, setModalOpenByName] = useState(null)

  useEffect(() => {
    if (task) {
      loadTask()
    }
  }, [task])

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
  }, [params])

  function loadTask() {
    setNewFiles(task.attachments)
    setTaskSelectedLabels(task.labels)
    setNewDueDate(task.dueDate)
    setNewCheckLists(task.checklists)
    setTaskMembers(task.members)
  }

  function calculateTaskNumber() {
    let taskNumber = 0

    for (const grp of board.groups) {
      if (grp.id === groupId) {
        const taskIndex = grp.tasks.findIndex(task => task.id === taskId)
        taskNumber += taskIndex + 2
        break
      } else {
        taskNumber += grp.tasks.length
      }
    }
    return taskNumber
  }

  async function onUpdated(name, value) {
    try {
      const updatedBoard = await boardService.updateBoard(board, groupId, taskId, {
        key: name,
        value: value,
      })
      if (name === 'checklists') {
        setNewCheckLists([...value])
      }
      if (name === 'members') {
        setTaskMembers([...value])
      }
      await updateBoard(updatedBoard)
    } catch (error) {
      console.error('Failed to update the board:', error)
    }
  }

  function onEdit(ev) {
    const dataName = ev.currentTarget.getAttribute('data-name')
    setCurrElToEdit(dataName)
  }

  function onCloseDialog() {
    navigate(`/board/${boardId}`)
    if (dialogRef.current) {
      dialogRef.current.close()
    }
  }

  function handleDialogClick(ev) {
    if (ev.target === dialogRef.current) {
      onCloseDialog()
    }
  }

  async function deleteTask(ev) {
    ev.preventDefault()

    try {
      onUpdated('deleteTask', null)
      await boardService.updateActivities(
        board,
        '',
        'deleteTask',
        group,
        task,
        '',
        calculateTaskNumber()
      )
      navigate(`/board/${boardId}`)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
  function handleClick(ev) {
    const currDataName = ev.currentTarget.getAttribute('data-name')
    setIsPopoverOpen(isPopoverOpen => !isPopoverOpen)
    setAnchorEl(ev.currentTarget)
    setModalOpenByName(currDataName)
  }

  function handleAddLabel(ev) {
    ev.preventDefault()
    handleClick(ev)
  }
  if (!task) return

  return (
    <section className='task-details'>
      <dialog
        ref={dialogRef}
        method='dialog'
        onClick={handleDialogClick}
        style={{
          gridTemplateRows: currCover.color
            ? '100px max-content max-content'
            : '0 max-content max-content',
        }}>
        <button className='close-btn' onClick={onCloseDialog}>
          <SvgIcon iconName='close' />
        </button>

        {currCover.color && (
          <div className='absolute-element' style={{ height: '100px' }}>
            <CoverDisplay
              currCover={currCover}
              height='100px'
              imgHeight='100px'
              colorHeight='100px'
            />
          </div>
        )}

        <form className='header' data-name='title' onClick={onEdit}>
          <FaRegCreditCard />

          <section className='titles'>
            {currElToEdit !== 'title' ? (
              <span className='task-title'>{task?.title || 'Untitled Task'}</span>
            ) : (
              <Edit
                task={task}
                onUpdated={onUpdated}
                currElToEdit={currElToEdit}
                setCurrElToEdit={setCurrElToEdit}
              />
            )}
            <span className='group-title'>in list {group.title}</span>
          </section>
        </form>
        <form>
          <div className='information'>
            {task.members.length > 0 && (
              <ul className='member-list'>
                <p className='header'>Members</p>

                {task.members && (
                  <MemberList members={taskMembers} gridColumnWidth='32px' />
                )}
                <div
                  className='add-member-button'
                  data-name='members'
                  onClick={handleAddLabel}>
                  <IoAddOutline
                    style={{
                      fontSize: '20px',
                      color: '#0079bf',
                    }}
                  />
                </div>
              </ul>
            )}

            {/* Label-List */}
            <section className='labels-container'>
              {taskSelectedLabels?.length > 0 && (
                <ul className='labels'>
                  <p className='header'>Labels</p>
                  <LabelList taskLabels={taskSelectedLabels} />
                </ul>
              )}
              <div
                className='add-label-button'
                data-name='labels'
                onClick={handleAddLabel}>
                <IoAddOutline
                  style={{
                    fontSize: '20px',
                    color: '#0079bf',
                  }}
                />
              </div>
            </section>

            <div
              className='task-details-due-date-container'
              style={{
                gridRow:
                  taskSelectedLabels?.length > 0 && task.members.length > 1 ? 2 : 1,
                gridColumn:
                  taskSelectedLabels?.length > 0 && task.members.length > 1 ? '2/4' : 5,
              }}>
              <DueDateDisplay
                dueDate={task.dueDate}
                setNewDueDate={setNewDueDate}
                onUpdated={onUpdated}
              />
            </div>
          </div>

          {currElToEdit !== 'description' ? (
            <section className='description-container'>
              <VscListFlat />
              <h3>Description</h3>
              <p
                className='editable-description'
                data-name='description'
                onClick={onEdit}>
                {task?.description || 'Add a more detailed description...'}
              </p>
            </section>
          ) : (
            <Edit
              task={task}
              onUpdated={onUpdated}
              currElToEdit={currElToEdit}
              setCurrElToEdit={setCurrElToEdit}
            />
          )}

          {task?.attachments && task.attachments.length > 0 && (
            <AttachmentList
              files={task.attachments}
              onUpdated={onUpdated}
              task={task}
              setNewFiles={setNewFiles}
            />
          )}

          {task?.checklists && task.checklists.length > 0 && (
            <TaskChecklist
              checklists={newChecklists}
              onUpdated={onUpdated}
              task={task}
              group={group}
              board={board}
            />
          )}
        </form>
        <form className='actions-container'>
          <div className='task-details-actions'>
            <TaskDetailsActions
              board={board}
              group={group}
              task={task}
              boardId={board?._id}
              groupId={group.id}
              taskId={task.id}
              setBoardSelectedLabels={setBoardSelectedLabels}
              setTaskSelectedLabels={setTaskSelectedLabels}
              onUpdated={onUpdated}
              setNewDueDate={setNewDueDate}
              setNewCheckLists={setNewCheckLists}
              setNewFiles={setNewFiles}
              setCurrCover={setCurrCover}
              currCover={currCover}
              newFiles={newFiles}
              handleClick={handleClick}
              anchorEl={anchorEl}
              setIsPopoverOpen={setIsPopoverOpen}
              modalOpenByName={modalOpenByName}
              isPopoverOpen={isPopoverOpen}
              setTaskMembers={setTaskMembers}
              taskMembers={taskMembers}
              deleteTask={deleteTask}
            />
          </div>
        </form>
      </dialog>
    </section>
  )
}
