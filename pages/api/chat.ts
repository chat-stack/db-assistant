import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Client } from 'pg';

type ResponseData = {
  messages?: ThreadMessage[];
  error?: any;
};

interface IGetEntityRelationsArgs {
  table_name: 'buyer' | 'order' | 'group_order' | 'user';
}

interface IGetTableSchemaDdlArgs {
  table_name: 'buyer' | 'order' | 'group_order' | 'user';
}

let client: Client;

const getClient = () => {
  if (client) return client;
  if (
    !process.env.POSTGRES_USER ||
    !process.env.POSTGRES_HOST ||
    !process.env.POSTGRES_DATABASE ||
    !process.env.POSTGRES_PASSWORD ||
    !process.env.POSTGRES_PORT
  ) {
    throw new Error('Missing env variable');
  }
  return new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: +process.env.POSTGRES_PORT,
  });
};

const mockToolCallOutputs = {
  get_entity_relations: {
    buyer: {
      relations: [
        {
          constraint_name: 'buyer_buyer_group_id_foreign',
          table_name: 'buyer',
          column_name: 'buyer_group_id',
          referenced_table_name: 'buyer_group',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'buyer_special_referral_id_foreign',
          table_name: 'buyer',
          column_name: 'special_referral_id',
          referenced_table_name: 'special_referral',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'buyer_recommend_id_foreign',
          table_name: 'buyer',
          column_name: 'recommend_id',
          referenced_table_name: 'recommend',
          referenced_column_name: 'id',
        },
      ],
    },
    order: {
      relations: [
        {
          constraint_name: 'order_group_order_id_foreign',
          table_name: '"order"',
          column_name: 'group_order_id',
          referenced_table_name: 'group_order',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'order_supplier_id_foreign',
          table_name: '"order"',
          column_name: 'supplier_id',
          referenced_table_name: 'supplier',
          referenced_column_name: 'id',
        },
      ],
    },
    group_order: {
      relations: [
        {
          constraint_name: 'group_order_checkout_id_foreign',
          table_name: 'group_order',
          column_name: 'checkout_id',
          referenced_table_name: 'checkout',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'group_order_payment_id_foreign',
          table_name: 'group_order',
          column_name: 'payment_id',
          referenced_table_name: 'payment',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'group_order_buyer_id_foreign',
          table_name: 'group_order',
          column_name: 'buyer_id',
          referenced_table_name: 'buyer',
          referenced_column_name: 'id',
        },
      ],
    },
    user: {
      relations: [
        {
          constraint_name: 'user_supplier_id_foreign',
          table_name: '"user"',
          column_name: 'supplier_id',
          referenced_table_name: 'supplier',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'user_buyer_id_foreign',
          table_name: '"user"',
          column_name: 'buyer_id',
          referenced_table_name: 'buyer',
          referenced_column_name: 'id',
        },
        {
          constraint_name: 'user_cart_id_foreign',
          table_name: '"user"',
          column_name: 'cart_id',
          referenced_table_name: 'cart',
          referenced_column_name: 'id',
        },
      ],
    },
  },
  get_table_schema_ddl: {
    buyer: {
      sql_ddl: `CREATE TABLE public.buyer (
        id serial4 NOT NULL,
        created_at timestamptz(0) NOT NULL,
        updated_at timestamptz(0) NOT NULL,
        email varchar(255) NULL,
        website varchar(255) NULL,
        store_name varchar(255) NULL,
        phone_number varchar(255) NULL,
        annual_sales text NULL,
        "source" text NULL,
        source_account_name text NULL,
        is_approved bool NOT NULL DEFAULT false,
        buyer_types _text NULL DEFAULT '{}'::text[],
        selling_interest _text NOT NULL DEFAULT '{}'::text[],
        product_wrapper_type_preferences _text NOT NULL DEFAULT '{}'::text[],
        category_tag_preferences _text NULL DEFAULT '{}'::text[],
        curr_buying_brands _text NULL DEFAULT '{}'::text[],
        help text NULL,
        stripe_customer_id varchar(255) NULL,
        slope_customer_id varchar(255) NULL,
        slope_customer_external_id varchar(255) NULL,
        slope_pre_qualification_status text NOT NULL DEFAULT 'NOT_STARTED'::text,
        recommend_id int4 NULL,
        curr_purchasing_budget text NULL,
        product_condition_preferences _text NULL DEFAULT '{}'::text[],
        average_basket_size text NULL,
        years_in_business text NULL,
        resell_license varchar(255) NULL,
        buyer_group_id int4 NULL,
        is_individual bool NULL,
        sms_consent bool NULL,
        special_referral_copy jsonb NULL,
        special_referral_id int4 NULL,
        CONSTRAINT buyer_annual_sales_check CHECK ((annual_sales = ANY (ARRAY['0 - 100K'::text, '100K - 300K'::text, '300K - 500K'::text, '500K - 1M'::text, '1M - 5M'::text, '5M - 10M'::text, '10M+'::text]))),
        CONSTRAINT buyer_average_basket_size_check CHECK ((average_basket_size = ANY (ARRAY['FROM_20_TO_50'::text, 'FROM_50_TO_100'::text, 'FROM_100_TO_200'::text, 'FROM_200_ABOVE'::text]))),
        CONSTRAINT buyer_curr_purchasing_budget_check CHECK ((curr_purchasing_budget = ANY (ARRAY['FROM_0_TO_5_K'::text, 'FROM_5_TO_10_K'::text, 'FROM_10_TO_20_K'::text, 'FROM_20_TO_30_K'::text, 'FROM_30_K_PLUS'::text]))),
        CONSTRAINT buyer_pkey PRIMARY KEY (id),
        CONSTRAINT buyer_slope_pre_qualification_status_check CHECK ((slope_pre_qualification_status = ANY (ARRAY['NOT_STARTED'::text, 'PRE_QUALIFIED'::text, 'INELIGIBLE'::text]))),
        CONSTRAINT buyer_source_check CHECK ((source = ANY (ARRAY['ADS'::text, 'TIKTOK'::text, 'FRIEND_OR_WORD_OF_MOUTH'::text, 'INSTAGRAM'::text, 'YOUTUBE'::text, 'FACEBOOK_GROUP'::text, 'BLOG_OR_ARTICLE'::text, 'SEARCH_RESULTS'::text, 'OTHER'::text, 'MAGIC'::text]))),
        CONSTRAINT buyer_years_in_business_check CHECK ((years_in_business = ANY (ARRAY['LESS_THAN_ONE'::text, 'ONE_TO_TWO'::text, 'TWO_TO_THREE'::text, 'THREE_TO_FOUR'::text, 'FOUR_TO_FIVE'::text, 'FIVE_PLUS'::text]))),
        CONSTRAINT buyer_buyer_group_id_foreign FOREIGN KEY (buyer_group_id) REFERENCES public.buyer_group(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT buyer_recommend_id_foreign FOREIGN KEY (recommend_id) REFERENCES public.recommend(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT buyer_special_referral_id_foreign FOREIGN KEY (special_referral_id) REFERENCES public.special_referral(id) ON DELETE SET NULL ON UPDATE CASCADE
      );`,
    },
    order: {
      sql_ddl: `CREATE TABLE public."order" (
        id serial4 NOT NULL,
        created_at timestamptz(0) NOT NULL,
        updated_at timestamptz(0) NOT NULL,
        cancel_reason varchar(255) NULL,
        cancel_at timestamptz(0) NULL,
        close_at timestamptz(0) NULL,
        ship_at timestamptz(0) NULL,
        currency varchar(255) NOT NULL,
        discount_code varchar(255) NULL,
        current_total_discount int4 NOT NULL,
        total_discount int4 NOT NULL,
        shipping_line jsonb NULL,
        shipping_lines jsonb NULL,
        tax_line jsonb NOT NULL,
        estimate_tax int4 NOT NULL,
        current_total_tax int4 NOT NULL,
        total_tax int4 NOT NULL,
        current_subtotal_price int4 NOT NULL,
        initial_subtotal_price int4 NULL,
        subtotal_price int4 NOT NULL,
        total_line_items_price int4 NOT NULL,
        initial_shipping_rate int4 NOT NULL DEFAULT 1000,
        shipping_rate int4 NOT NULL DEFAULT 1000,
        total_outstanding int4 NOT NULL,
        current_total_price int4 NOT NULL,
        initial_total_price int4 NULL,
        total_price int4 NOT NULL,
        order_status_url varchar(255) NOT NULL,
        status text NOT NULL,
        return_requested_at timestamptz(0) NULL,
        return_processed_at timestamptz(0) NULL,
        return_completed_at timestamptz(0) NULL,
        order_updated_at timestamptz(0) NULL,
        is_modified bool NOT NULL DEFAULT false,
        modification_credit int4 NULL,
        modification_accept_refund int4 NULL,
        modification_reject_refund int4 NULL,
        order_modification_accepted text NULL,
        old_order_schema bool NOT NULL DEFAULT false,
        is_below_modification_threshold bool NOT NULL DEFAULT false,
        order_modification_threshold int4 NOT NULL DEFAULT 0,
        has_modification_credit_issued bool NULL,
        order_modification_credit_minimum_order_amount int4 NULL,
        commission_percentage int4 NOT NULL DEFAULT 0,
        base_shipping_rate int4 NOT NULL DEFAULT 0,
        variable_shipping_rate int4 NOT NULL DEFAULT 0,
        shipping_unit_threshold int4 NOT NULL DEFAULT 0,
        free_shipping_threshold int4 NULL,
        group_order_id int4 NOT NULL,
        supplier_id int4 NOT NULL,
        convictional_seller_order_id varchar(255) NULL,
        convictional_buyer_order_id varchar(255) NULL,
        convictional_buyer_reference varchar(255) NULL,
        convictional_seller_reference varchar(255) NULL,
        convictional_customer_reference varchar(255) NULL,
        convictional_seller_company_object_id varchar(255) NULL,
        convictional_base_currency varchar(255) NULL,
        convictional_packing_slip_url varchar(255) NULL,
        convictional_invoice_id varchar(255) NULL,
        convictional_posted bool NULL,
        convictional_posted_date varchar(255) NULL,
        convictional_fulfilled bool NULL,
        convictional_fulfilled_date varchar(255) NULL,
        convictional_invoiced bool NULL,
        convictional_invoiced_date varchar(255) NULL,
        convictional_created_at varchar(255) NULL,
        convictional_updated_at varchar(255) NULL,
        CONSTRAINT order_order_modification_accepted_check CHECK ((order_modification_accepted = ANY (ARRAY['MANUAL'::text, 'AUTOMATIC'::text]))),
        CONSTRAINT order_pkey PRIMARY KEY (id),
        CONSTRAINT order_status_check CHECK ((status = ANY (ARRAY['Pending_Approval'::text, 'Pending_Buyer_Acceptance'::text, 'Approved'::text, 'Rejected'::text, 'Cancelled'::text, 'Shipped'::text, 'Hold'::text, 'Close'::text, 'Return_Requested'::text, 'Processing_Return'::text, 'Return_Complete'::text, 'Open'::text, 'Closed'::text]))),
        CONSTRAINT order_group_order_id_foreign FOREIGN KEY (group_order_id) REFERENCES public.group_order(id) ON UPDATE CASCADE,
        CONSTRAINT order_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES public.supplier(id) ON UPDATE CASCADE
      );
      CREATE INDEX order_convictional_seller_order_id_index ON public."order" USING btree (convictional_seller_order_id);`,
    },
    group_order: {
      sql_ddl: `CREATE TABLE public.group_order (
        id serial4 NOT NULL,
        created_at timestamptz(0) NOT NULL,
        updated_at timestamptz(0) NOT NULL,
        billing_address jsonb NULL,
        shipping_address jsonb NULL,
        broweser_ip varchar(255) NOT NULL,
        cancel_reason varchar(255) NULL,
        cancel_at timestamptz(0) NULL,
        close_at timestamptz(0) NULL,
        currency varchar(255) NOT NULL,
        current_applied_credit int4 NULL,
        applied_credit int4 NULL,
        current_total_discount int4 NOT NULL,
        total_discount int4 NOT NULL,
        total_line_items_price int4 NOT NULL,
        current_subtotal_price int4 NOT NULL,
        subtotal_price int4 NOT NULL,
        tax_line jsonb NOT NULL,
        estimate_tax int4 NOT NULL,
        current_total_tax int4 NOT NULL,
        total_tax int4 NOT NULL,
        current_shipping_rate int4 NOT NULL DEFAULT 0,
        shipping_rate int4 NOT NULL DEFAULT 0,
        current_total_price int4 NOT NULL,
        total_price int4 NOT NULL,
        order_number serial4 NOT NULL,
        payment_processing_method varchar(255) NOT NULL,
        tags varchar(255) NOT NULL,
        discount_code varchar(255) NULL,
        discount_amount int4 NULL,
        discount_type text NULL,
        total_outstanding int4 NOT NULL,
        order_status_url varchar(255) NOT NULL,
        has_referral_credits_issued bool NULL,
        status text NOT NULL,
        old_order_schema bool NOT NULL DEFAULT false,
        merchant_fee int4 NULL,
        customer_fee int4 NULL,
        total_with_fees int4 NULL,
        amount_outstanding int4 NULL,
        amount_paid int4 NULL,
        checkout_id int4 NOT NULL,
        payment_id int4 NOT NULL,
        buyer_id int4 NOT NULL,
        convictional_id varchar(255) NULL,
        convictional_buyer_reference varchar(255) NULL,
        convictional_customer_reference varchar(255) NULL,
        convictional_ordered_date varchar(255) NULL,
        convictional_created_at varchar(255) NULL,
        convictional_updated_at varchar(255) NULL,
        commentsold_order_id varchar(255) NULL,
        CONSTRAINT group_order_checkout_id_unique UNIQUE (checkout_id),
        CONSTRAINT group_order_commentsold_order_id_unique UNIQUE (commentsold_order_id),
        CONSTRAINT group_order_discount_type_check CHECK ((discount_type = ANY (ARRAY['flat'::text, 'percentage'::text]))),
        CONSTRAINT group_order_payment_id_unique UNIQUE (payment_id),
        CONSTRAINT group_order_pkey PRIMARY KEY (id),
        CONSTRAINT group_order_status_check CHECK ((status = ANY (ARRAY['Pending_Approval'::text, 'Pending_Buyer_Acceptance'::text, 'Approved'::text, 'Rejected'::text, 'Cancelled'::text, 'Shipped'::text, 'Hold'::text, 'Close'::text, 'Return_Requested'::text, 'Processing_Return'::text, 'Return_Complete'::text, 'Open'::text, 'Closed'::text]))),
        CONSTRAINT group_order_buyer_id_foreign FOREIGN KEY (buyer_id) REFERENCES public.buyer(id) ON UPDATE CASCADE,
        CONSTRAINT group_order_checkout_id_foreign FOREIGN KEY (checkout_id) REFERENCES public.checkout(id) ON UPDATE CASCADE,
        CONSTRAINT group_order_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE
      );
      CREATE INDEX group_order_convictional_id_index ON public.group_order USING btree (convictional_id);`,
    },
    user: {
      sql_ddl: `CREATE TABLE public."user" (
        id serial4 NOT NULL,
        created_at timestamptz(0) NOT NULL,
        updated_at timestamptz(0) NOT NULL,
        email varchar(255) NOT NULL,
        encrypted_password varchar(255) NOT NULL,
        roles _text NOT NULL DEFAULT '{USER}'::text[],
        first_name varchar(255) NOT NULL,
        last_name varchar(255) NOT NULL,
        mobile_number varchar(255) NULL,
        is_verified bool NOT NULL DEFAULT false,
        verification_code varchar(255) NULL,
        is_email_change bool NULL DEFAULT false,
        referral_code varchar(255) NULL,
        reset_code varchar(255) NULL,
        utm jsonb NULL,
        supplier_id int4 NULL,
        buyer_id int4 NULL,
        cart_id int4 NULL,
        CONSTRAINT user_cart_id_unique UNIQUE (cart_id),
        CONSTRAINT user_email_unique UNIQUE (email),
        CONSTRAINT user_pkey PRIMARY KEY (id),
        CONSTRAINT user_buyer_id_foreign FOREIGN KEY (buyer_id) REFERENCES public.buyer(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT user_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT user_supplier_id_foreign FOREIGN KEY (supplier_id) REFERENCES public.supplier(id) ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX user_email_index ON public."user" USING btree (email);`,
    },
  },
};

const get_entity_relations = (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
): OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput => {
  const args: IGetEntityRelationsArgs = JSON.parse(
    tool_call.function.arguments
  );
  // if (args.table_name.includes('"')) {
  //   args.table_name = args.table_name.replace(/"/g, '');
  // }
  
  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify(
      mockToolCallOutputs.get_entity_relations[args.table_name] || {
        success: 'false',
      }
    ),
  };
};

const get_table_schema_ddl = (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
): OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput => {
  const args: IGetTableSchemaDdlArgs = JSON.parse(tool_call.function.arguments);
  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify(
      mockToolCallOutputs.get_table_schema_ddl[args.table_name] || {
        success: 'false',
      }
    ),
  };
};

const dispatchToolCall = (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
) => {
  if (tool_call.type === 'function') {
    switch (tool_call.function.name) {
      case 'get_entity_relations':
        return get_entity_relations(tool_call);
      case 'get_table_schema_ddl':
        return get_table_schema_ddl(tool_call);
      default:
        break;
    }
  }
  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify({
      success: 'false',
    }),
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  let responseSent = false; // Flag to track if response has been sent

  const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      const interval = 100; // Interval to check the flag
      const startTime = Date.now();
      const check = () => {
        if (responseSent || Date.now() - startTime >= ms) {
          clearInterval(timer);
          resolve();
        }
      };
      const timer = setInterval(check, interval);
    });
  };

  if (req.method !== 'POST') {
    return res.status(405);
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(405);
  }

  try {
    const { content, threadId, lastMessageId } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let thread: Thread;
    if (threadId) {
      thread = await openai.beta.threads.retrieve(threadId);
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content,
      });
      thread = await openai.beta.threads.retrieve(threadId);
    } else {
      thread = await openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      });
    }
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_4jYNnW5NVzZVDg7zDf6vtdVF',
    });
    const pollingHandler = async () => {
      const retrievedRun = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      console.log(retrievedRun.status);
      if (
        retrievedRun.status !== 'queued' &&
        retrievedRun.status !== 'in_progress' &&
        retrievedRun.status !== 'requires_action'
      ) {
        clearInterval(pollingId);
      }
      if (retrievedRun.status === 'completed') {
        // return messages back to FE
        let messages: ThreadMessage[];
        if (!lastMessageId) {
          messages = (await openai.beta.threads.messages.list(thread.id)).data;
        } else {
          messages = (
            await openai.beta.threads.messages.list(thread.id, {
              after: lastMessageId,
            })
          ).data;
        }
        console.log(messages);
        responseSent = true;
        res.status(200).json({ messages });
        return;
      }
      if (retrievedRun.status === 'requires_action') {
        // need to submit tool outputs
        if (retrievedRun.required_action?.type === 'submit_tool_outputs') {
          const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
            retrievedRun.required_action.submit_tool_outputs.tool_calls.map(
              (
                tool_call
              ): OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput => {
                console.log(tool_call);
                return dispatchToolCall(tool_call);
              }
            );
          console.log(tool_outputs);
          await openai.beta.threads.runs.submitToolOutputs(
            thread.id,
            retrievedRun.id,
            {
              tool_outputs,
            }
          );
        }
      }
    };
    const startPolling = () => setInterval(pollingHandler, 1000);
    const pollingId = startPolling();

    await delay(30000);
    clearInterval(pollingId);

    if (!responseSent) {
      res
        .status(500)
        .json({ error: 'Internal server error, no response from OpenAI' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;
