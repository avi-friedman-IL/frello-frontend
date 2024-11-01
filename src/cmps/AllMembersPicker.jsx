import { useState } from "react";

export function AllMembersPicker({
  users,
  onUpdated,
  members,
  setNewBoardMembers,
}) {
  const allUsers = users;
  const availableUsers = allUsers.filter(
    (user) => !members.some((member) => member?._id === user?._id)
  );

  function handleAddUserToBoard(ev, user) {
    ev.stopPropagation();
    const membersToUpdate = [...members, user];
    setNewBoardMembers(membersToUpdate);
    onUpdated("members", membersToUpdate);
  }
  return (
    <div className="all-members-picker">
      {/* <h1>members</h1> */}
      {availableUsers.length > 0 && (
        <ul>
          {availableUsers.map((user) => (
            <li
              className="member-item"
              key={user._id}
              onClick={(ev) => handleAddUserToBoard(ev, user)}
            >
              {user.imgUrl && (
                <img
                  src={user.imgUrl}
                  style={{
                    borderRadius: "50%",
                    width: "24px",
                    marginInlineEnd: "10px",
                  }}
                />
              )}
              {!user.imgUrl && (
                <span style={{ backgroundColor: user.color }}>
                  {user.fullname[0]}
                </span>
              )}
              <span className="member-name">{user.fullname}</span>
            </li>
          ))}
        </ul>
      )}
      {!availableUsers.length > 0 && <div>No more users to add</div>}
    </div>
  );
}
