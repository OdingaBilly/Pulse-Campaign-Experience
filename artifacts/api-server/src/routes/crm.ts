import { Router, type IRouter, type Response } from "express";
import { asc, eq } from "drizzle-orm";
import { db, crmContactsTable, crmTasksTable, communitySignalsTable } from "@workspace/db";
import {
  CreateCommunitySignalBody,
  CreateCommunitySignalResponse,
  CreateCrmContactBody,
  CreateCrmContactResponse,
  CreateCrmTaskBody,
  CreateCrmTaskResponse,
  GetCrmOverviewResponse,
  ListCommunitySignalsResponse,
  ListCrmContactsResponse,
  ListCrmTasksResponse,
  UpdateCommunitySignalBody,
  UpdateCommunitySignalParams,
  UpdateCommunitySignalResponse,
  UpdateCrmContactBody,
  UpdateCrmContactParams,
  UpdateCrmContactResponse,
  UpdateCrmTaskBody,
  UpdateCrmTaskParams,
  UpdateCrmTaskResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const subscribers = new Set<Response>();
let seedPromise: Promise<void> | null = null;

type CrmEvent = {
  type: string;
  entity: string;
  entityId: number;
  occurredAt: string;
};

function publish(event: CrmEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const subscriber of subscribers) {
    try {
      subscriber.write(payload);
    } catch {
      subscribers.delete(subscriber);
    }
  }
}

function timestamp(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function eventTime(value: Date): string {
  return value.toISOString();
}

function toContact(contact: typeof crmContactsTable.$inferSelect) {
  return {
    ...contact,
    lastContactedAt: timestamp(contact.lastContactedAt),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

function toTask(task: typeof crmTasksTable.$inferSelect) {
  return {
    ...task,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function toSignal(signal: typeof communitySignalsTable.$inferSelect) {
  return {
    ...signal,
    communityVisible: signal.communityVisible === "true",
    createdAt: signal.createdAt.toISOString(),
    updatedAt: signal.updatedAt.toISOString(),
  };
}

async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const existing = await db
        .select({ id: crmContactsTable.id })
        .from(crmContactsTable)
        .limit(1);
      if (existing.length > 0) return;

      await db.insert(crmContactsTable).values([
        {
          name: "Mara Chen",
          role: "Route team lead",
          area: "Mobility",
          affiliation: "Harbor Loop working group",
          status: "active",
          engagementScore: 92,
          lastContactedAt: new Date("2026-08-18T07:15:00.000Z"),
          nextAction: "Confirm the South Harbor listening stop",
          notes: "Coordinates route-by-route listening sessions with late-shift riders.",
        },
        {
          name: "Ravi Singh",
          role: "Housing partner",
          area: "Housing",
          affiliation: "Homes Near Work",
          status: "partner",
          engagementScore: 78,
          lastContactedAt: new Date("2026-08-17T14:30:00.000Z"),
          nextAction: "Review the first site plan",
          notes: "Keeps the site plan review grounded in plain-language questions.",
        },
        {
          name: "Jo Bell",
          role: "Stewardship coordinator",
          area: "Climate",
          affiliation: "Living Shoreline",
          status: "lead",
          engagementScore: 64,
          lastContactedAt: null,
          nextAction: "Invite to creek field day",
          notes: "Potential partner for neighborhood stewardship.",
        },
        {
          name: "Theo Brooks",
          role: "Small business liaison",
          area: "Local economy",
          affiliation: "Open Doors",
          status: "dormant",
          engagementScore: 41,
          lastContactedAt: new Date("2026-08-10T09:00:00.000Z"),
          nextAction: "Share the retention readout",
          notes: "Reconnect after the first-year retention review.",
        },
      ]);

      await db.insert(crmTasksTable).values([
        {
          title: "Confirm South Harbor listening stop",
          status: "in-progress",
          priority: "high",
          dueDate: "2026-08-21",
          owner: "Maya Chen",
          contactId: 1,
        },
        {
          title: "Send plain-language site plan",
          status: "todo",
          priority: "medium",
          dueDate: "2026-08-23",
          owner: "Ravi Singh",
          contactId: 2,
        },
        {
          title: "Invite stewardship partners",
          status: "todo",
          priority: "low",
          dueDate: "2026-08-28",
          owner: "Jo Bell",
          contactId: 3,
        },
        {
          title: "Close first-year retention notes",
          status: "done",
          priority: "medium",
          dueDate: "2026-08-15",
          owner: "Theo Brooks",
          contactId: 4,
        },
      ]);

      await db.insert(communitySignalsTable).values([
        {
          area: "Mobility",
          summary: "The final eastbound Harbor Loop connection leaves before late shifts end.",
          status: "new",
          source: "community portal",
          communityVisible: "true",
        },
        {
          area: "Climate",
          summary: "The temporary path to Willow Creek needs a safer surface before the next wet season.",
          status: "triaged",
          source: "community portal",
          communityVisible: "true",
        },
        {
          area: "Housing",
          summary: "Neighbors want a plain-language explanation of how the first site plan was selected.",
          status: "in-progress",
          source: "community portal",
          communityVisible: "true",
        },
      ]);
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

async function loadOverview() {
  const [contacts, tasks, signals] = await Promise.all([
    db.select().from(crmContactsTable).orderBy(asc(crmContactsTable.name)),
    db.select().from(crmTasksTable).orderBy(asc(crmTasksTable.status), asc(crmTasksTable.dueDate)),
    db
      .select()
      .from(communitySignalsTable)
      .orderBy(asc(communitySignalsTable.status), asc(communitySignalsTable.createdAt)),
  ]);
  const averageEngagement = contacts.length
    ? Math.round(
        contacts.reduce((total, contact) => total + contact.engagementScore, 0) /
          contacts.length,
      )
    : 0;

  return {
    summary: {
      totalContacts: contacts.length,
      activeContacts: contacts.filter((contact) => contact.status === "active").length,
      openTasks: tasks.filter((task) => task.status !== "done").length,
      highPriorityTasks: tasks.filter(
        (task) => task.priority === "high" && task.status !== "done",
      ).length,
      newSignals: signals.filter((signal) => signal.status === "new").length,
      averageEngagement,
    },
    contacts: contacts.map(toContact),
    tasks: tasks.map(toTask),
    signals: signals.map(toSignal),
  };
}

router.get("/crm/overview", async (_req, res): Promise<void> => {
  await ensureSeeded();
  res.json(GetCrmOverviewResponse.parse(await loadOverview()));
});

router.get("/crm/contacts", async (_req, res): Promise<void> => {
  await ensureSeeded();
  const contacts = await db
    .select()
    .from(crmContactsTable)
    .orderBy(asc(crmContactsTable.name));
  res.json(ListCrmContactsResponse.parse(contacts.map(toContact)));
});

router.post("/crm/contacts", async (req, res): Promise<void> => {
  const parsed = CreateCrmContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [contact] = await db
    .insert(crmContactsTable)
    .values({
      ...parsed.data,
      lastContactedAt: parsed.data.lastContactedAt
        ? new Date(parsed.data.lastContactedAt)
        : null,
    })
    .returning();
  const output = CreateCrmContactResponse.parse(toContact(contact));
  publish({
    type: "contact.created",
    entity: "contact",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.status(201).json(output);
});

router.patch("/crm/contacts/:id", async (req, res): Promise<void> => {
  const params = UpdateCrmContactParams.safeParse(req.params);
  const parsed = UpdateCrmContactBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid contact update" });
    return;
  }
  const [contact] = await db
    .update(crmContactsTable)
    .set({
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.engagementScore !== undefined
        ? { engagementScore: parsed.data.engagementScore }
        : {}),
      ...(parsed.data.lastContactedAt !== undefined
        ? {
            lastContactedAt: parsed.data.lastContactedAt
              ? new Date(parsed.data.lastContactedAt)
              : null,
          }
        : {}),
      ...(parsed.data.nextAction !== undefined
        ? { nextAction: parsed.data.nextAction }
        : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
      updatedAt: new Date(),
    })
    .where(eq(crmContactsTable.id, params.data.id))
    .returning();
  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }
  const output = UpdateCrmContactResponse.parse(toContact(contact));
  publish({
    type: "contact.updated",
    entity: "contact",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.json(output);
});

router.get("/crm/tasks", async (_req, res): Promise<void> => {
  await ensureSeeded();
  const tasks = await db
    .select()
    .from(crmTasksTable)
    .orderBy(asc(crmTasksTable.status), asc(crmTasksTable.dueDate));
  res.json(ListCrmTasksResponse.parse(tasks.map(toTask)));
});

router.post("/crm/tasks", async (req, res): Promise<void> => {
  const parsed = CreateCrmTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db
    .insert(crmTasksTable)
    .values({
      title: parsed.data.title,
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate
        ? parsed.data.dueDate.toISOString().slice(0, 10)
        : null,
      owner: parsed.data.owner,
      contactId: parsed.data.contactId ?? null,
    })
    .returning();
  const output = CreateCrmTaskResponse.parse(toTask(task));
  publish({
    type: "task.created",
    entity: "task",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.status(201).json(output);
});

router.patch("/crm/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateCrmTaskParams.safeParse(req.params);
  const parsed = UpdateCrmTaskBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid task update" });
    return;
  }
  const { dueDate, ...taskUpdate } = parsed.data;
  const [task] = await db
    .update(crmTasksTable)
    .set({
      ...taskUpdate,
      ...(dueDate !== undefined
        ? {
            dueDate: dueDate
              ? dueDate.toISOString().slice(0, 10)
              : null,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(crmTasksTable.id, params.data.id))
    .returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const output = UpdateCrmTaskResponse.parse(toTask(task));
  publish({
    type: "task.updated",
    entity: "task",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.json(output);
});

router.get("/community/signals", async (_req, res): Promise<void> => {
  await ensureSeeded();
  const signals = await db
    .select()
    .from(communitySignalsTable)
    .orderBy(asc(communitySignalsTable.createdAt));
  res.json(ListCommunitySignalsResponse.parse(signals.map(toSignal)));
});

router.post("/community/signals", async (req, res): Promise<void> => {
  const parsed = CreateCommunitySignalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [signal] = await db
    .insert(communitySignalsTable)
    .values({
      area: parsed.data.area,
      summary: parsed.data.summary,
      status: "new",
      source: "community portal",
      communityVisible: "true",
    })
    .returning();
  const output = CreateCommunitySignalResponse.parse(toSignal(signal));
  publish({
    type: "signal.created",
    entity: "signal",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.status(201).json(output);
});

router.patch("/community/signals/:id", async (req, res): Promise<void> => {
  const params = UpdateCommunitySignalParams.safeParse(req.params);
  const parsed = UpdateCommunitySignalBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Invalid signal update" });
    return;
  }
  const [signal] = await db
    .update(communitySignalsTable)
    .set({
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
      ...(parsed.data.communityVisible !== undefined
        ? { communityVisible: String(parsed.data.communityVisible) }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(communitySignalsTable.id, params.data.id))
    .returning();
  if (!signal) {
    res.status(404).json({ error: "Signal not found" });
    return;
  }
  const output = UpdateCommunitySignalResponse.parse(toSignal(signal));
  publish({
    type: "signal.updated",
    entity: "signal",
    entityId: output.id,
    occurredAt: eventTime(output.updatedAt),
  });
  res.json(output);
});

router.get("/crm/stream", (req, res): void => {
  res.set({
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  res.write("retry: 5000\n\n");
  subscribers.add(res);
  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 25000);
  req.on("close", () => {
    clearInterval(heartbeat);
    subscribers.delete(res);
  });
});

export default router;