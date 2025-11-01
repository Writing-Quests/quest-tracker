<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251031000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE quest (
              id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)',
              start_date DATE DEFAULT NULL COMMENT '(DC2Type:date_immutable)',
              end_date DATE DEFAULT NULL COMMENT '(DC2Type:date_immutable)',
              goal_type VARCHAR(255) DEFAULT NULL,
              goal_units VARCHAR(255) DEFAULT NULL,
              goal_amount NUMERIC(14, 2) DEFAULT NULL,
              title LONGTEXT NOT NULL,
              PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE quest_user (
              quest_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)',
              user_id INT NOT NULL,
              INDEX IDX_83997ABB209E9EF4 (quest_id),
              INDEX IDX_83997ABBA76ED395 (user_id),
              PRIMARY KEY(quest_id, user_id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              quest_user
            ADD
              CONSTRAINT FK_83997ABB209E9EF4 FOREIGN KEY (quest_id) REFERENCES quest (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE
              quest_user
            ADD
              CONSTRAINT FK_83997ABBA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE quest_user DROP FOREIGN KEY FK_83997ABB209E9EF4
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE quest_user DROP FOREIGN KEY FK_83997ABBA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quest
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE quest_user
        SQL);
    }
}
