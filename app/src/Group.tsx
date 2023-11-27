import React from "react";

import Area from "./Area";
import Container from "./common/Container";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import { getDumpBucket, getOtherBuckets } from "./context/helper";
import Bucket from "./Bucket";
import Title from "./common/Title";
import InfoModal from "./common/InfoModal";

interface GroupProps {}

const Group: React.FC<GroupProps> = (props) => {
  const { getBuckets } = useData();

  const buckets = getBuckets();
  const others = getOtherBuckets(buckets);
  const dump = getDumpBucket(buckets);

  if (!dump) {
    console.error("No dump bucket found.");
    return;
  }

  return (
    <Container>
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className={`w-full h-full`}>
          <div className="flex items-center justify-start gap-2">
            <Title title="Dump" />
            <InfoModal
              title="Dump"
              info={`Put everything you think you will have to do here into the dump.
This helps you consider "the whole" by turning the whole thing into, e.g., rough implementation tasks without concerning yourself with structure and order before starting on any one area.`}
            />
          </div>
          <Area bucket={dump} />
        </div>
        <div className="col-span-2">
          <div className="flex items-center justify-start gap-2">
            <Title title="Task Grouper" />
            <InfoModal
              title="Task Grouper"
              info={`Drag the initial tasks (and, as things progress, any discovered tasks) from the dump (or add directly to a named task group) into unnamed groups by asking yourself: "What can be completed together and in isolation from the rest?".
Task group boxes are usually named after you and your team cluster the tasks and look at the actual work to ensure the task groups show real relationships in the work and not arbitrary categories. Then, consider which task groups, if any, have risky unknowns and flag them.
You can track the movement of work between “Figuring out”, “Figured out”, and “Done” states. When you add a task to a task group, it is by default considered an "In-progress Figuring out" state.
When a task item is checked, the task’s state auto-switches to "Figured out". Only after all tasks are "Figured out" does the task group's "Done" checkbox appear, which you can click when the task group is done.
All task groups are considered at risk so long as at least one task is in a "Figuring out" state since all tasks are assumed to work together to make one piece, or slice, work so you can move on to the next task group or finish the project.`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 ">
            <FlexCol>
              {others.slice(0, 5).map((bucket) => (
                <Bucket bucket={bucket} key={bucket.id} />
              ))}
            </FlexCol>
            <FlexCol>
              {others.slice(-5).map((bucket) => (
                <Bucket bucket={bucket} key={bucket.id} />
              ))}
            </FlexCol>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Group;
