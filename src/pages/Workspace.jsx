import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import { Sidebar } from "../cmps/Sidebar";

export function Workspace() {
  const navigate = useNavigate();

  // const user = useSelector((state) => state.userModule.loggedInUser);

  return (
    <section className="workspace">
      <Sidebar />
      <h2>Your Boards</h2>
      <div className="new-board" onClick={() => navigate("/board/123")}>
        <span>Create new board</span>
      </div>
    </section>
  );
}
