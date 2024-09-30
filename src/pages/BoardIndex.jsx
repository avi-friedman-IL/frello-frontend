import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  loadBoards,
  addBoard,
  updateBoard,
  removeBoard,
  addBoardMsg,
} from "../store/actions/board.actions";

import { showSuccessMsg, showErrorMsg } from "../services/event-bus.service";
import { boardService } from "../services/board";
import { userService } from "../services/user";

import { BoardList } from "../cmps/BoardList";
import { BoardFilter } from "../cmps/BoardFilter";
import { SideBar } from "../cmps/Sidebar";
import { AppHeader } from "../cmps/AppHeader";
import { useNavigate } from "react-router";
import { StarredBoardsList } from "../cmps/StarredBoardsList";
import { loadUsers } from "../store/actions/user.actions";
import { CircleLoader, ClipLoader, RingLoader, RotateLoader } from "react-spinners";

export function BoardIndex() {
  const [filterBy, setFilterBy] = useState(boardService.getDefaultFilter());
  const boards = useSelector((storeState) => storeState.boardModule.boards);
  const isLoading = useSelector((storeState) => storeState.boardModule.isLoading);
  const starredBoards = Array.isArray(boards)
    ? boards.filter((board) => board.isStarred)
    : [];

  useEffect(() => {
    loadBoards();
    loadUsers();
  }, [boards.length]);

  useEffect(() => {
    loadBoards(filterBy);
  }, [filterBy]);

  async function onRemoveBoard(ev, boardId) {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      await removeBoard(boardId);
      showSuccessMsg("Board removed");
    } catch (err) {
      showErrorMsg("Cannot remove board");
    }
  }

  async function onAddBoard(board) {
    const emptyBoard = boardService.getEmptyBoard();
    const boardToSave = {
      ...emptyBoard,
      members: [...emptyBoard.members, emptyBoard.createdBy],
      title: board.title,
      style: {
        ...emptyBoard.style,
        backgroundImage: board.backgroundImage,
      },
    };
    console.log(boardToSave);
    try {
      boardService.updateActivities(
        boardToSave,
        "created this board",
        "createBoard"
      );
      boardService.updateActivities(
        boardToSave,
        "added this board to",
        "addBoard"
      );
      const savedBoard = await addBoard(boardToSave);
      console.log(savedBoard);
      showSuccessMsg(`Board added (id: ${savedBoard._id})`);

      // navigate(`/board/${savedBoard._id}`);
    } catch (err) {
      showErrorMsg("Cannot add board");
    }
  }

  async function onUpdateBoard(ev, board) {
    ev.preventDefault();
    ev.stopPropagation();
    const title = prompt(board.title);
    board.title = title;
    try {
      await updateBoard(board);
      showSuccessMsg("Board updated");
    } catch (err) {
      showErrorMsg("Cannot update board");
    }
  }

  function handleCreateBoard(board) {
    console.log(board);
    onAddBoard(board);
    handleClosePopover();
  }

  function handleClosePopover() {
    setIsPopoverOpen(false);
    setAnchorEl(null);
    setModalOpenByName(null);
  }

  if (isLoading) return <div className="loader">{<RingLoader color="#0079bf" />}</div>;
  if (!boards || !boards.length) return;
  console.log(import.meta.env.VITE_SERVER);
  return (
    <>
      <AppHeader
        starredBoards={starredBoards}
        borderBottom="1px solid #ddd"
        logoImg="https://cdn.icon-icons.com/icons2/2699/PNG/512/trello_logo_icon_167765.png"
        logoColor="#0c66e4"
        link={`${import.meta.env.VITE_SERVER}/`}
      />
      <section
        className="board-index"
        style={{
          // backgroundImage: `url(https://cdn.pixabay.com/photo/2017/02/19/11/19/background-2079405_1280.jpg)`,
          // backgroundSize: "cover",
          gridTemplateColumns:
            boards.length > 0
              ? `minmax(1rem, 1fr) auto minmax(1rem, 1fr)`
              : "1",
          rowGap: "2em",
        }}
      >
        {/* <SideBar /> */}

        <StarredBoardsList
          starredBoards={starredBoards}
          onRemoveBoard={onRemoveBoard}
        />
        {/* <BoardFilter filterBy={filterBy} setFilterBy={setFilterBy} /> */}
        <BoardList
          boards={boards}
          starredBoards={starredBoards}
          onAddBoard={onAddBoard}
          onRemoveBoard={onRemoveBoard}
          onUpdateBoard={onUpdateBoard}
        />
      </section>
    </>
  );
}
