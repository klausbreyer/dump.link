import React from "react";

import { UserIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "../common/InfoTooltip";
import { useJWT } from "../context/jwt";
import { useOrg } from "../context/org";
import { isActivityOutdated, sortActivitiesByDate } from "../models/activities";
import {
  extractInitials,
  extractUsername,
  getUsername,
  getUsernameFromPrompt,
  isAnonymous,
  isPublicUser,
  isSelf,
} from "../models/userid";
import { findUser } from "../models/users";
import { dateToHumanReadable } from "../utils/dates";
import { useData } from "./context/data";
import { Activity, UserName } from "./types";

const HeaderActivity: React.FC = () => {
  const { activities } = useData();
  const { sub } = useJWT();
  const sortedActivities = sortActivitiesByDate(activities);
  const [username, setUsername] = React.useState<string>(getUsername());

  function handleChangeUsername() {
    const newUsername = getUsernameFromPrompt();
    setUsername(newUsername);
  }
  const live = sortedActivities
    .filter((activity) => !isActivityOutdated(activity.createdAt))
    .filter((activity) => !isSelf(activity.createdBy, sub))
    .filter((activity) => !isAnonymous(activity.createdBy));

  return (
    <div className="flex items-start gap-2">
      <Avatar userID={username} onClick={handleChangeUsername} type="self" />
      {live.map((activity) => (
        <ActivityAvatar key={activity.createdBy} activity={activity} />
      ))}
    </div>
  );
};

export default HeaderActivity;

interface ActivityAvatarProps {
  activity: Activity;
}

export const ActivityAvatar: React.FC<ActivityAvatarProps> = ({ activity }) => {
  const userID = activity.createdBy;

  return (
    <Avatar userID={userID} type={"other"} lastSeen={activity.createdAt} />
  );
};

interface AvatarProps {
  userID: UserName;
  onClick?: () => void;
  lastSeen?: Date;
  type: "self" | "other" | "inactive";
}

export const Avatar: React.FC<AvatarProps> = ({
  userID,
  onClick,
  lastSeen,
  type,
}) => {
  const { users } = useOrg();

  let tooltipname = "Anonymous";
  let avatar = <UserIcon className="w-5 h-5" />;
  if (isPublicUser(userID)) {
    avatar = <span>{extractInitials(userID)}</span>;
    tooltipname = extractUsername(userID);
  }
  if (users.length > 0) {
    const user = findUser(userID, users);
    if (user) {
      avatar = <img src={user.picture} className="rounded-full" />;
    }
  }

  return (
    <Tooltip
      info={
        lastSeen
          ? `${tooltipname}, last seen: ${dateToHumanReadable(lastSeen)}`
          : "You"
      }
    >
      <div
        className={`flex items-center justify-center w-6 h-6 text-sm font-bold uppercase rounded-full bg-slate-50 ring-2
		${onclick ? "cursor-pointer" : "cursor-help"}
	${
    type === "self" &&
    "hover:ring-indigo-800 ring-indigo-500 hover:text-indigo-800 text-indigo-500"
  } ${
    type === "other" &&
    "hover:ring-purple-800 ring-purple-500 hover:text-purple-800 text-purple-500"
  } ${
    type === "inactive" &&
    "hover:ring-slate-500 ring-slate-300 hover:text-slate-500 text-slate-300"
  }
		  `}
        onClick={onClick}
      >
        {avatar}
      </div>
    </Tooltip>
  );
};
