import React from "react";

import { UserIcon } from "@heroicons/react/24/solid";
import { Tooltip } from "./common/InfoTooltip";
import { useData } from "./context/data";
import {
  isActivityOutdated,
  sortActivitiesByDate,
} from "./context/helper_activities";
import { getInitials, getUsername } from "./context/helper_requests";
import { Activity, UserName } from "./types";
import { dateToHumanReadable, dateToISO } from "./context/helper_dates";

const HeaderActivity: React.FC = () => {
  const { activities } = useData();
  const sortedActivities = sortActivitiesByDate(activities);
  const [username, setUsername] = React.useState<string>(getUsername());

  function handleChangeUsername() {
    const newUsername = prompt(
      "Please enter your name as you would like your team to see it",
      getUsername(),
    );
    localStorage.setItem("username", newUsername || "");

    setUsername(getUsername());
  }

  const others = sortedActivities.filter(
    (activity) => activity.createdBy !== username,
  );

  return (
    <div className="flex items-start gap-2">
      <Avatar username={username} onClick={handleChangeUsername} type="self" />
      {others.map((activity) => (
        <ActivityAvatar key={activity.createdBy} activity={activity} />
      ))}
    </div>
  );
};

export default HeaderActivity;

interface ActivityAvatarProps {
  activity: Activity;
}

const ActivityAvatar: React.FC<ActivityAvatarProps> = ({ activity }) => {
  const username = activity.createdBy;

  const inactive = isActivityOutdated(activity.createdAt);
  return (
    <Avatar
      username={username}
      type={inactive ? "inactive" : "other"}
      lastSeen={activity.createdAt}
    />
  );
};

interface AvatarProps {
  username: UserName;
  onClick?: () => void;
  lastSeen?: Date;
  type: "self" | "other" | "inactive";
}

const Avatar: React.FC<AvatarProps> = ({
  username,
  onClick,
  lastSeen,
  type,
}) => {
  const initials = getInitials(username);
  return (
    <Tooltip
      info={
        lastSeen
          ? `${username}, last seen: ${dateToHumanReadable(lastSeen)}`
          : "You"
      }
    >
      <div
        className={`flex items-center justify-center w-6 h-6 text-sm font-bold uppercase rounded-full  ring-2
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
        {initials === "" && <UserIcon className="w-5 h-5" />}
        {initials !== "" && <span>{initials}</span>}
      </div>
    </Tooltip>
  );
};
