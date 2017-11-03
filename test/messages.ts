/* tslint:disable:no-bitwise */

import {
  TOPIC,
  AUTH_ACTIONS as AA,
  CONNECTION_ACTIONS as CA,
  EVENT_ACTIONS as EA,
  PARSER_ACTIONS as XA,
  PRESENCE_ACTIONS as UA,
  RECORD_ACTIONS as RA,
  RPC_ACTIONS as PA,
  Message,
} from '../src/message-constants'

interface MessageSpec {
  message: Message
  urp: {
    value: Buffer
    args: Array<String>
    payload: string | null
  }
}

function m (data): MessageSpec {
  data.message = Object.assign({
    isAck: false,
    isError: false,
  }, data.message)
  return data
}

function binMsg (
  topicByte: number,
  actionByte: number,
  meta: string | object,
  payload: string | object,
  fin: boolean = true,
): Buffer {
  if (typeof meta === 'object') {
    meta = JSON.stringify(meta)
  }
  if (typeof payload === 'object') {
    payload = JSON.stringify(payload)
  }
  const metaLen = Buffer.byteLength(meta)
  const payloadLen = Buffer.byteLength(payload)
  return Buffer.concat([
    Buffer.from([
      (fin ? 0x80 : 0x00) | topicByte,
      actionByte,
      metaLen >> 16,
      metaLen >> 8,
      metaLen,
      payloadLen >> 16,
      payloadLen >> 8,
      payloadLen,
    ]),
    Buffer.from(meta, 'utf8'),
    Buffer.from(payload, 'utf8'),
  ])
}

function extendWithGenericMessages (topic, actions, messages) {
  Object.assign(messages, {
    ERROR: null,
    INVALID_MESSAGE_DATA: null,
  })
}

function extendWithPermissionErrorMessages (topic, actions, messages: {[key: string]: MessageSpec | null}) {
  Object.assign(messages, {
    MESSAGE_PERMISSION_ERROR: m({
      message: {
        isAck: false,
        isError: true,
        topic,
        action: actions.MESSAGE_PERMISSION_ERROR,
        name: 'username',
      },
      urp: {
        value: binMsg(
          topic,
          actions.MESSAGE_PERMISSION_ERROR,
          { n: 'username' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
    MESSAGE_DENIED: m({
      message: {
        isAck: false,
        isError: true,
        topic,
        action: actions.MESSAGE_DENIED,
        name: 'username',
      },
      urp: {
        value: binMsg(
          topic,
          actions.MESSAGE_DENIED,
          { n: 'username' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
  })
}

function extendWithSubscriptionMessages (topic, actions, messages) {
  Object.assign(messages, {
    SUBSCRIBE: m({
      message: {
        topic,
        action: actions.SUBSCRIBE,
        name: 'subscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.SUBSCRIBE,
          { n: 'subscription' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent to subscribe to a given name',
        source: 'client'
      }
    }),
    SUBSCRIBE_ACK: m({
      message: {
        isAck: true,
        topic,
        action: actions.SUBSCRIBE,
        name: 'subscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.SUBSCRIBE_ACK,
          { n: 'subscription' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent when a \'SUBSCRIBE\' message is permissioned and the subscription registered,',
        source: 'server'
      }
    }),
    UNSUBSCRIBE: m({
      message: {
        topic,
        action: actions.UNSUBSCRIBE,
        name: 'subscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.UNSUBSCRIBE,
          { n: 'subscription' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent to unsubscribe to a given name',
        source: 'client'
      }
    }),
    UNSUBSCRIBE_ACK: m({
      message: {
        isAck: true,
        topic,
        action: actions.UNSUBSCRIBE,
        name: 'subscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.UNSUBSCRIBE_ACK,
          { n: 'subscription' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent when an \'UNSUBSCRIBE\' message is permissioned and the subscription deregistered,',
        source: 'server'
      }
    }),
    MULTIPLE_SUBSCRIPTIONS: m({
      message: {
        isAck: false,
        isError: true,
        topic,
        action: actions.MULTIPLE_SUBSCRIPTIONS,
        name: 'username',
      },
      urp: {
        value: binMsg(
          topic,
          actions.MULTIPLE_SUBSCRIPTIONS,
          { n: 'username' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent in response to a \'SUBSCRIBE\' message if the subscription already exists',
        source: 'server'
      }
    }),
    NOT_SUBSCRIBED: m({
      message: {
        isAck: false,
        isError: true,
        topic,
        action: actions.NOT_SUBSCRIBED,
        name: 'username',
      },
      urp: {
        value: binMsg(
          topic,
          actions.NOT_SUBSCRIBED,
          { n: 'username' },
          ''
        ),
        args: ['name'],
        payload: null,
        description: 'Sent in response to an \'UNSUBSCRIBE\' message if the subscription does not already exist',
        source: 'server'
      }
    }),
  })
}

function extendWithListenMessages (topic, actions, messages) {
  Object.assign(messages, {
    LISTEN: m({
      message: {
        topic,
        action: actions.LISTEN,
        name: '.*',
      },
      urp: {
        value: binMsg(
          topic,
          actions.LISTEN,
          { n: '.*' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
    LISTEN_ACK: m({
      message: {
        isAck: true,
        topic,
        action: actions.LISTEN,
        name: '.*',
      },
      urp: {
        value: binMsg(
          topic,
          actions.LISTEN_ACK,
          { n: '.*' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
    UNLISTEN: m({
      message: {
        topic,
        action: actions.UNLISTEN,
        name: '.*',
      },
      urp: {
        value: binMsg(
          topic,
          actions.UNLISTEN,
          { n: '.*' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
    UNLISTEN_ACK: m({
      message: {
        isAck: true,
        topic,
        action: actions.UNLISTEN,
        name: '.*',
      },
      urp: {
        value: binMsg(
          topic,
          actions.UNLISTEN_ACK,
          { n: '.*' },
          ''
        ),
        args: ['name'],
        payload: null,
      }
    }),
    SUBSCRIPTION_FOR_PATTERN_FOUND: m({
      message: {
        topic,
        action: actions.SUBSCRIPTION_FOR_PATTERN_FOUND,
        name: '.*',
        subscription: 'someSubscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.SUBSCRIPTION_FOR_PATTERN_FOUND,
          { n: '.*', s: 'someSubscription' },
          ''
        ),
        args: ['name', 'subscription'],
        payload: null,
      }
    }),
    SUBSCRIPTION_FOR_PATTERN_REMOVED: m({
      message: {
        topic,
        action: actions.SUBSCRIPTION_FOR_PATTERN_REMOVED,
        name: '.*',
        subscription: 'someSubscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.SUBSCRIPTION_FOR_PATTERN_REMOVED,
          { n: '.*', s: 'someSubscription' },
          ''
        ),
        args: ['name', 'subscription'],
        payload: null,
      }
    }),
    LISTEN_ACCEPT: m({
      message: {
        topic,
        action: actions.LISTEN_ACCEPT,
        name: '.*',
        subscription: 'someSubscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.LISTEN_ACCEPT,
          { n: '.*', s: 'someSubscription' },
          ''
        ),
        args: ['name', 'subscription'],
        payload: null,
      }
    }),
    LISTEN_REJECT: m({
      message: {
        topic,
        action: actions.LISTEN_REJECT,
        name: '.*',
        subscription: 'someSubscription',
      },
      urp: {
        value: binMsg(
          topic,
          actions.LISTEN_REJECT,
          { n: '.*', s: 'someSubscription' },
          ''
        ),
        args: ['name', 'subscription'],
        payload: null,
      }
    }),
  })
}

export const PARSER_MESSAGES: { [key: string]: MessageSpec } = {
  UNKNOWN_TOPIC: m({
    message: {
      topic: TOPIC.PARSER,
      action: XA.UNKNOWN_TOPIC,
      reason: 'topic',
      isError: true
    },
    urp: {
      value: binMsg(TOPIC.PARSER, XA.UNKNOWN_TOPIC, { r: 'topic' }, ''),
      args: ['reason'],
      payload: null,
    }
  }),
  UNKNOWN_ACTION: m({
    message: {
      topic: TOPIC.PARSER,
      action: XA.UNKNOWN_ACTION,
      reason: 'action',
      isError: true
    },
    urp: {
      value: binMsg(TOPIC.PARSER, XA.UNKNOWN_ACTION, { r: 'action' }, ''),
      args: ['reason'],
      payload: null,
    }
  }),
  INVALID_MESSAGE: m({
    message: {
      topic: TOPIC.PARSER,
      action: XA.INVALID_MESSAGE,
      reason: 'too long',
      isError: true
    },
    urp: {
      value: binMsg(TOPIC.PARSER, XA.INVALID_MESSAGE, { r: 'too long' }, ''),
      args: ['reason'],
      payload: null,
    }
  }),
  MESSAGE_PARSE_ERROR: m({
    message: {
      topic: TOPIC.PARSER,
      action: XA.MESSAGE_PARSE_ERROR,
      isError: true
    },
    urp: {
      value: binMsg(TOPIC.PARSER, XA.MESSAGE_PARSE_ERROR, '', ''),
      args: [],
      payload: null,
    }
  }),
  MAXIMUM_MESSAGE_SIZE_EXCEEDED: m({
    message: {
      topic: TOPIC.PARSER,
      action: XA.MAXIMUM_MESSAGE_SIZE_EXCEEDED,
      isError: true
    },
    urp: {
      value: binMsg(TOPIC.PARSER, XA.MAXIMUM_MESSAGE_SIZE_EXCEEDED, '', ''),
      args: [],
      payload: null,
    }
  })
}

export const CONNECTION_MESSAGES: {[key: string]: MessageSpec | null} = {
  PING: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.PING
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.PING, '', '') ,
      args: [],
      payload: null,
      description: 'Sent periodically to ensure a live connection',
      source: 'server'
    },
  }),
  PONG: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.PONG
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.PONG, '', ''),
      args: [],
      payload: null,
      description: 'Sent immediately in response to a \'Ping\' message',
      source: 'client'
    }
  }),
  CHALLENGE: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.CHALLENGE,
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.CHALLENGE, '', ''),
      args: [],
      payload: null,
      description: 'Sent as soon as a connection is established',
      source: 'server'
    }
  }),
  CHALLENGE_RESPONSE: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.CHALLENGE_RESPONSE,
      url: 'ws://url.io',
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.CHALLENGE_RESPONSE, { u: 'ws://url.io' }, ''),
      args: ['url'],
      payload: null,
      description: 'Sent when a \'Connection Challenge\' is received',
      source: 'client'
    }
  }),
  ACCEPT: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.ACCEPT,
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.ACCEPT, '', ''),
      args: [],
      payload: null,
      description: 'Sent in response to a \'Challenge Response\' if the requested URL is valid',
      source: 'server'
    }
  }),
  REJECT: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.REJECT,
      reason: 'reason',
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.REJECT, { r: 'reason' }, ''),
      args: ['reason'],
      payload: null,
      description: 'Sent in response to a \'Challenge Response\' if the requested URL is invalid',
      source: 'server'
    }
  }),
  REDIRECT: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.REDIRECT,
      url: 'ws://url.io',
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.REDIRECT, { u: 'ws://url.io' }, ''),
      args: ['url'],
      payload: null,
      description: 'Sent to redirect a client to a different url',
      source: 'server'
    }
  }),
  CLOSING: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.CLOSING,
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.CLOSING, '', ''),
      args: [],
      payload: null,
      description: 'Sent to server when closing the connection',
      source: 'client'
    }
  }),
  CLOSED: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.CLOSED,
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.CLOSED, '', ''),
      args: [],
      payload: null,
      description: 'Sent to client when acknowledging graceful close',
      source: 'server'
    }
  }),
  ERROR: null,
  CONNECTION_AUTHENTICATION_TIMEOUT: m({
    message: {
      topic: TOPIC.CONNECTION,
      action: CA.CONNECTION_AUTHENTICATION_TIMEOUT,
    },
    urp: {
      value: binMsg(TOPIC.CONNECTION, CA.CONNECTION_AUTHENTICATION_TIMEOUT, '', ''),
      args: [],
      payload: null,
      description: 'Sent if a connection has not authenticated successfully within the configured AUTHENTICATION_TIMEOUT',
      source: 'server'
    }
  })
}

export const AUTH_MESSAGES: {[key: string]: MessageSpec | null} = {
  REQUEST: m({
    message: {
      topic: TOPIC.AUTH,
      action: AA.REQUEST,
      parsedData: { username: 'ricardo' },
    },
    urp: {
      value: binMsg(TOPIC.AUTH, AA.REQUEST, '', { username: 'ricardo' }),
      args: [],
      payload: 'authData',
      description: 'Sent to authenticate a client with optional credentials',
      source: 'client'
    }
  }),
  AUTH_SUCCESSFUL: m({
    message: {
      topic: TOPIC.AUTH,
      action: AA.AUTH_SUCCESSFUL,
      parsedData: { id: 'foobar' },
    },
    urp: {
      value: binMsg(TOPIC.AUTH, AA.AUTH_SUCCESSFUL, '', { id: 'foobar' }),
      args: [],
      payload: 'clientData',
      description: 'Sent if authentication was successful',
      source: 'server'
    }
  }),
  AUTH_UNSUCCESSFUL: m({
    message: {
      topic: TOPIC.AUTH,
      action: AA.AUTH_UNSUCCESSFUL,
      reason: 'errorMessage',
    },
    urp: {
      value: binMsg(TOPIC.AUTH, AA.AUTH_UNSUCCESSFUL, { r: 'errorMessage' }, ''),
      args: ['reason'],
      payload: null,
      description: 'Sent if authentication was unsuccessful',
      source: 'server'
    }
  }),
  TOO_MANY_AUTH_ATTEMPTS: m({
    message: {
      topic: TOPIC.AUTH,
      action: AA.TOO_MANY_AUTH_ATTEMPTS,
    },
    urp: {
      value: binMsg(TOPIC.AUTH, AA.TOO_MANY_AUTH_ATTEMPTS, '', ''),
      args: [],
      payload: null,
      description: 'Sent if the number of unsuccessful authentication attempts exceeds a configured maximum. Followed by a connection close.',
      source: 'server'
    }
  }),
  MESSAGE_PERMISSION_ERROR: null,
  MESSAGE_DENIED: null,
  ERROR: null,
  INVALID_MESSAGE_DATA: m({
    message: {
      isAck: false,
      isError: true,
      topic: TOPIC.AUTH,
      action: AA.INVALID_MESSAGE_DATA,
      reason: '[invalid',
    },
    urp: {
      value: binMsg(TOPIC.AUTH, AA.INVALID_MESSAGE_DATA, { r: '[invalid' }, ''),
      args: ['reason'],
      payload: null,
      description: 'Sent if the provided authentication data is invalid.',
      source: 'server'
    }
  }),
}

export const RECORD_MESSAGES: {[key: string]: MessageSpec | null} = {
  HEAD: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.HEAD,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.HEAD, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
      description: 'Sent to request the current version of a given record',
      source: 'client'
    }
  }),
  HEAD_RESPONSE: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.HEAD_RESPONSE,
      name: 'user/someId',
      version: 12,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.HEAD_RESPONSE, { n: 'user/someId', v: 12 }, ''),
      args: ['name', 'version'],
      payload: null,
      description: 'Sent in response to a \'HEAD\' message with the current version of a record',
      source: 'server'
    }
  }),
  READ: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.READ,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.READ, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
      description: 'Sent to request the content of a given record',
      source: 'client'
    }
  }),
  READ_RESPONSE: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.READ_RESPONSE,
      name: 'user/someId',
      parsedData: {firstname: 'Wolfram'},
      version: 1,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.READ_RESPONSE, { n: 'user/someId', v: 1 }, { firstname: 'Wolfram' }),
      args: ['name', 'version'],
      payload: 'recordData',
      description: 'Sent in response to a \'READ\' message with the current version and content of a record',
      source: 'server'
    }
  }),
  UPDATE: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.UPDATE,
      name: 'user/someId',
      version: 1,
      parsedData: { firstname: 'Wolfram' },
      isWriteAck: false,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.UPDATE, { n: 'user/someId', v: 1 }, { firstname: 'Wolfram' }),
      args: ['name', 'version'],
      payload: 'recordData',
    }
  }),
  UPDATE_WITH_WRITE_ACK: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.UPDATE,
      name: 'user/someId',
      version: 1,
      parsedData: { firstname: 'Wolfram' },
      isWriteAck: true,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.UPDATE_WITH_WRITE_ACK, { n: 'user/someId', v: 1 }, { firstname: 'Wolfram' }),
      args: ['name', 'version'],
      payload: 'recordData',
    }
  }),
  PATCH: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.PATCH,
      name: 'user/someId',
      path: 'path',
      version: 1,
      parsedData: 'data',
      isWriteAck: false,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.PATCH, { n: 'user/someId', v: 1, p: 'path' }, '"data"'),
      args: ['name', 'version', 'path'],
      payload: 'patchData',
    }
  }),
  PATCH_WITH_WRITE_ACK: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.PATCH,
      name: 'user/someId',
      path: 'path',
      version: 1,
      parsedData: 'data',
      isWriteAck: true,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.PATCH_WITH_WRITE_ACK, { n: 'user/someId', v: 1, p: 'path' }, '"data"'),
      args: ['name', 'version', 'path'],
      payload: 'patchData',
    }
  }),
  ERASE: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.ERASE,
      name: 'user/someId',
      path: 'path',
      version: 1,
      isWriteAck: false,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.ERASE, { n: 'user/someId', v: 1, p: 'path' }, ''),
      args: ['name', 'version', 'path'],
      payload: null,
    }
  }),
  ERASE_WITH_WRITE_ACK: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.ERASE,
      name: 'user/someId',
      path: 'path',
      version: 1,
      isWriteAck: true,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.ERASE_WITH_WRITE_ACK, { n: 'user/someId', v: 1, p: 'path' }, ''),
      args: ['name', 'version', 'path'],
      payload: null,
    }
  }),
  CREATEANDUPDATE: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.CREATEANDUPDATE,
      name: 'user/someId',
      version: 1,
      parsedData: { name: 'bob' },
      isWriteAck: false,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.CREATEANDUPDATE, { n: 'user/someId', v: 1 }, { name: 'bob' }),
      args: ['name', 'version'],
      payload: 'recordData',
    }
  }),
  CREATEANDUPDATE_WITH_WRITE_ACK: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.CREATEANDUPDATE,
      name: 'user/someId',
      version: 1,
      parsedData: { name: 'bob' },
      isWriteAck: true,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.CREATEANDUPDATE_WITH_WRITE_ACK, { n: 'user/someId', v: 1 }, { name: 'bob' }),
      args: ['name', 'version'],
      payload: 'recordData',
    }
  }),
  CREATEANDPATCH: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.CREATEANDPATCH,
      name: 'user/someId',
      version: 1,
      path: 'path',
      parsedData: 'data',
      isWriteAck: false,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.CREATEANDPATCH, { n: 'user/someId', v: 1, p: 'path' }, '"data"'),
      args: ['name', 'version', 'path'],
      payload: 'patchData',
    }
  }),
  CREATEANDPATCH_WITH_WRITE_ACK: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.CREATEANDPATCH,
      name: 'user/someId',
      version: 1,
      path: 'path',
      parsedData: 'data',
      isWriteAck: true,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.CREATEANDPATCH_WITH_WRITE_ACK, { n: 'user/someId', v: 1, p: 'path' }, '"data"'),
      args: ['name', 'version', 'path'],
      payload: 'patchData',
    }
  }),
  DELETE : m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.DELETE,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.DELETE, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  DELETE_ACK : m({
    message: {
      isAck: true,
      topic: TOPIC.RECORD,
      action: RA.DELETE,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.DELETE_ACK, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  DELETED : m({
    message: {
      isAck: false,
      topic: TOPIC.RECORD,
      action: RA.DELETED,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.DELETED, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  SUBSCRIBECREATEANDREAD: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.SUBSCRIBECREATEANDREAD,
      name: 'user/someId',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.SUBSCRIBECREATEANDREAD, { n: 'user/someId' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  SUBSCRIPTION_HAS_PROVIDER: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.SUBSCRIPTION_HAS_PROVIDER,
      name: 'someSubscription',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.SUBSCRIPTION_HAS_PROVIDER, { n: 'someSubscription' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  SUBSCRIPTION_HAS_NO_PROVIDER: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.SUBSCRIPTION_HAS_NO_PROVIDER,
      name: 'someSubscription',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.SUBSCRIPTION_HAS_NO_PROVIDER, { n: 'someSubscription' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  WRITE_ACKNOWLEDGEMENT: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.WRITE_ACKNOWLEDGEMENT,
      name: 'someSubscription',
      parsedData: [ [-1], null ],
    },
    // FIXME: versions and errors should be in meta, not payload
    urp: {
      value: binMsg(TOPIC.RECORD, RA.WRITE_ACKNOWLEDGEMENT, { n: 'someSubscription' }, [[-1], null]),
      args: ['name'],
      payload: '[errorVersionsArray, errorData]',
    }
  }),
  VERSION_EXISTS: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.VERSION_EXISTS,
      name: 'recordName',
      parsedData: {},
      version: 1,
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.VERSION_EXISTS, { n: 'recordName', v: 1 }, {}),
      args: ['name', 'version'],
      payload: null,
    }
  }),
  CACHE_RETRIEVAL_TIMEOUT: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.CACHE_RETRIEVAL_TIMEOUT,
      name: 'recordName',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.CACHE_RETRIEVAL_TIMEOUT, { n: 'recordName' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  STORAGE_RETRIEVAL_TIMEOUT: m({
    message: {
      topic: TOPIC.RECORD,
      action: RA.STORAGE_RETRIEVAL_TIMEOUT,
      name: 'recordName',
    },
    urp: {
      value: binMsg(TOPIC.RECORD, RA.STORAGE_RETRIEVAL_TIMEOUT, { n: 'recordName' }, ''),
      args: ['name'],
      payload: null,
    }
  }),
  RECORD_LOAD_ERROR: null,
  RECORD_CREATE_ERROR: null,
  RECORD_UPDATE_ERROR: null,
  RECORD_DELETE_ERROR: null,
  RECORD_READ_ERROR: null,
  RECORD_NOT_FOUND: null,
  INVALID_VERSION: null,
  INVALID_PATCH_ON_HOTPATH: null,
  CREATE: null,
  SUBSCRIBEANDHEAD: null,
  SUBSCRIBEANDREAD: null,
  SUBSCRIBECREATEANDUPDATE: null,
  HAS: null,
  HAS_RESPONSE: null,
}
extendWithGenericMessages(TOPIC.RECORD, RA, RECORD_MESSAGES)
extendWithPermissionErrorMessages(TOPIC.RECORD, RA, RECORD_MESSAGES)
extendWithSubscriptionMessages(TOPIC.RECORD, RA, RECORD_MESSAGES)
extendWithListenMessages(TOPIC.RECORD, RA, RECORD_MESSAGES)

export const RPC_MESSAGES: { [key: string]: MessageSpec | null } = {
  REQUEST_ERROR: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.REQUEST_ERROR,
      name: 'addValues',
      correlationId: '1234',
      reason: 'ERROR_MESSAGE',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.REQUEST_ERROR,
        { n: 'addValues', c: '1234', r: 'ERROR_MESSAGE' },
        ''
      ),
      args: ['name', 'correlationId', 'reason'],
      payload: null
    }
  }),
  REQUEST: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.REQUEST,
      name: 'addValues',
      correlationId: '1234',
      parsedData: { val1: 1, val2: 2 },
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.REQUEST,
        { n: 'addValues', c: '1234' },
        { val1: 1, val2: 2 }
      ),
      args: ['name', 'correlationId'],
      payload: 'rpcData'
    }
  }),
  ACCEPT: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.ACCEPT,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.ACCEPT,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  REJECT: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.REJECT,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.REJECT,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  RESPONSE: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.RESPONSE,
      name: 'addValues',
      correlationId: '1234',
      parsedData: { val1: 1, val2: 2 },
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.RESPONSE,
        { n: 'addValues', c: '1234' },
        { val1: 1, val2: 2 }
      ),
      args: ['name', 'correlationId'],
      payload: 'rpcData'
    }
  }),
  PROVIDE: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.PROVIDE,
      name: 'addValues',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.PROVIDE,
        { n: 'addValues' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  PROVIDE_ACK: m({
    message: {
      isAck: true,
      topic: TOPIC.RPC,
      action: PA.PROVIDE,
      name: 'addValues',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.PROVIDE_ACK,
        { n: 'addValues' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  UNPROVIDE: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.UNPROVIDE,
      name: 'addValues',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.UNPROVIDE,
        { n: 'addValues' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  UNPROVIDE_ACK: m({
    message: {
      isAck: true,
      topic: TOPIC.RPC,
      action: PA.UNPROVIDE,
      name: 'addValues',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.UNPROVIDE_ACK,
        { n: 'addValues' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  MULTIPLE_PROVIDERS: null,
  NOT_PROVIDED: null,
  MULTIPLE_RESPONSE: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.MULTIPLE_RESPONSE,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.MULTIPLE_RESPONSE,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  RESPONSE_TIMEOUT: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.RESPONSE_TIMEOUT,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.RESPONSE_TIMEOUT,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  INVALID_RPC_CORRELATION_ID: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.INVALID_RPC_CORRELATION_ID,
      name: 'addValues',
      correlationId: '/=/=/=/',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.INVALID_RPC_CORRELATION_ID,
        { n: 'addValues', c: '/=/=/=/' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  MULTIPLE_ACCEPT: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.MULTIPLE_ACCEPT,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.MULTIPLE_ACCEPT,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  ACCEPT_TIMEOUT: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.ACCEPT_TIMEOUT,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.ACCEPT_TIMEOUT,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
  NO_RPC_PROVIDER: m({
    message: {
      topic: TOPIC.RPC,
      action: PA.NO_RPC_PROVIDER,
      name: 'addValues',
      correlationId: '1234',
    },
    urp: {
      value: binMsg(
        TOPIC.RPC,
        PA.NO_RPC_PROVIDER,
        { n: 'addValues', c: '1234' },
        ''
      ),
      args: ['name', 'correlationId'],
      payload: null
    }
  }),
}
extendWithGenericMessages(TOPIC.RPC, PA, RPC_MESSAGES)
extendWithPermissionErrorMessages(TOPIC.RPC, PA, RPC_MESSAGES)

export const EVENT_MESSAGES: { [key: string]: MessageSpec } = {
  EMIT: m({
    message: {
      topic: TOPIC.EVENT,
      action: EA.EMIT,
      name: 'someEvent',
      parsedData: 'data',
    },
    urp: {
      value: binMsg(TOPIC.EVENT, EA.EMIT, { n: 'someEvent' }, '"data"'),
      args: ['name'],
      payload: 'eventData',
      description: 'Sent to emit an event',
      source: 'client+server'
    }
  })
}
extendWithGenericMessages(TOPIC.EVENT, EA, EVENT_MESSAGES)
extendWithPermissionErrorMessages(TOPIC.EVENT, EA, EVENT_MESSAGES)
extendWithSubscriptionMessages(TOPIC.EVENT, EA, EVENT_MESSAGES)
extendWithListenMessages(TOPIC.EVENT, EA, EVENT_MESSAGES)

export const PRESENCE_MESSAGES: {[key: string]: MessageSpec | null} = {
  SUBSCRIBE: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.SUBSCRIBE,
      correlationId: '1234',
      parsedData: ['alan', 'john'],
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.SUBSCRIBE,
        { c: '1234' },
        ['alan', 'john']
      ),
      args: ['correlationId'],
      payload: 'userList'
    }
  }),
  SUBSCRIBE_ACK: m({
    message: {
      isAck: true,
      topic: TOPIC.PRESENCE,
      action: UA.SUBSCRIBE,
      name: 'alan',
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.SUBSCRIBE_ACK,
        { n: 'alan' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  UNSUBSCRIBE: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.UNSUBSCRIBE,
      correlationId: '1234',
      parsedData: ['alan', 'john'],
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.UNSUBSCRIBE,
        { c: '1234' },
        ['alan', 'john']
      ),
      args: ['correlationId'],
      payload: 'userList'
    }
  }),
  UNSUBSCRIBE_ACK: m({
    message: {
      isAck: true,
      topic: TOPIC.PRESENCE,
      action: UA.UNSUBSCRIBE,
      name: 'alan',
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.UNSUBSCRIBE_ACK,
        { n: 'alan' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  MULTIPLE_SUBSCRIPTIONS: null,
  NOT_SUBSCRIBED: null,
  QUERY_ALL: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.QUERY_ALL,
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.QUERY_ALL,
        '',
        ''
      ),
      args: [],
      payload: null
    }
  }),
  QUERY_ALL_RESPONSE: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.QUERY_ALL_RESPONSE,
      parsedData: ['alan', 'sarah'],
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.QUERY_ALL_RESPONSE,
        '',
        ['alan', 'sarah']
      ),
      args: [''],
      payload: 'userList'
    }
  }),
  QUERY: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.QUERY,
      correlationId: '1234',
      parsedData: ['alan'],
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.QUERY,
        { c: '1234' },
        ['alan']
      ),
      args: ['correlationId'],
      payload: 'userList'
    }
  }),
  QUERY_RESPONSE: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.QUERY_RESPONSE,
      correlationId: '1234',
      parsedData: { alan: true },
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.QUERY_RESPONSE,
        { c: '1234' },
        { alan: true }
      ),
      args: ['correlationId'],
      payload: 'userMap'
    }
  }),
  PRESENCE_JOIN: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.PRESENCE_JOIN,
      name: 'username',
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.PRESENCE_JOIN,
        { n: 'username' },
        ''
      ),
      args: ['name'],
      payload: null
    }
  }),
  PRESENCE_LEAVE: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.PRESENCE_LEAVE,
      name: 'username',
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.PRESENCE_LEAVE,
        { n: 'username' },
        ''
      ),
      args: ['name'],
      payload: 'userList'
    }
  }),
  INVALID_PRESENCE_USERS: m({
    message: {
      topic: TOPIC.PRESENCE,
      action: UA.INVALID_PRESENCE_USERS,
      reason: 'reason',
    },
    urp: {
      value: binMsg(
        TOPIC.PRESENCE,
        UA.INVALID_PRESENCE_USERS,
        { r: 'reason' },
        ''
      ),
      args: ['reason'],
      payload: null
    }
  }),
}
extendWithGenericMessages(TOPIC.PRESENCE, UA, PRESENCE_MESSAGES)
extendWithPermissionErrorMessages(TOPIC.PRESENCE, UA, PRESENCE_MESSAGES)

export const MESSAGES: {[key: number]: {[key: string]: MessageSpec | null}} = {
  [TOPIC.PARSER]: PARSER_MESSAGES,
  [TOPIC.RECORD]: RECORD_MESSAGES,
  [TOPIC.RPC]: RPC_MESSAGES,
  [TOPIC.EVENT]: EVENT_MESSAGES,
  [TOPIC.AUTH]: AUTH_MESSAGES,
  [TOPIC.CONNECTION]: CONNECTION_MESSAGES,
  [TOPIC.PRESENCE]: PRESENCE_MESSAGES,
}