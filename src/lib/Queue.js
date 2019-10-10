import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail];

/**
 * Para cada um desses "jobs" a gente cria uma fila
 * E dentro dessa fila a gente amazena o "bee"
 * O "bee" é a nossa instancia que conecta com o "redis"
 * O "redis" consegue armazenar e recuperar valores do banco de dados
 *
 * O "handle" processa a fila
 */

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    // Acessar métodos e propriedades da classe
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
